import fs from 'node:fs'
import { DatabaseSync } from 'node:sqlite'

const nowIso = () => new Date().toISOString()
const plain = (row) => (row ? { ...row } : null)

/** Size of the database plus its WAL file, in bytes. */
export function fileSize(dbPath) {
  let total = 0
  for (const file of [dbPath, `${dbPath}-wal`]) {
    try {
      total += fs.statSync(file).size
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  return total
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    email_lower TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_login_at TEXT,
    last_seen_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS password_resets (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`,
  'CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id)',
  'CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at)',
  'CREATE INDEX IF NOT EXISTS idx_resets_expires ON password_resets (expires_at)',
]

export class FureverDb {
  constructor(dbPath) {
    this.dbPath = dbPath
    this.db = new DatabaseSync(dbPath)
    this.closed = false
    this.db.exec('PRAGMA journal_mode = WAL')
    this.db.exec('PRAGMA foreign_keys = ON')
    this.db.exec('PRAGMA busy_timeout = 5000')
    for (const statement of SCHEMA) this.db.exec(statement)

    this.statements = {
      insertUser: this.db.prepare(
        `INSERT INTO users (email, email_lower, password_hash, created_at, last_login_at, last_seen_at)
         VALUES (?, ?, ?, ?, NULL, ?)`,
      ),
      findUserByEmail: this.db.prepare('SELECT * FROM users WHERE email_lower = ?'),
      findUserById: this.db.prepare('SELECT * FROM users WHERE id = ?'),
      touchLogin: this.db.prepare('UPDATE users SET last_login_at = ?, last_seen_at = ? WHERE id = ?'),
      touchSeen: this.db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?'),
      setPassword: this.db.prepare('UPDATE users SET password_hash = ? WHERE id = ?'),
      setEmail: this.db.prepare('UPDATE users SET email = ?, email_lower = ? WHERE id = ?'),
      createSession: this.db.prepare(
        `INSERT INTO sessions (token_hash, user_id, created_at, last_seen_at, expires_at)
         VALUES (?, ?, ?, ?, ?)`,
      ),
      findSession: this.db.prepare(
        `SELECT s.*, u.email, u.email_lower
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > ?`,
      ),
      touchSession: this.db.prepare(
        'UPDATE sessions SET last_seen_at = ?, expires_at = ? WHERE token_hash = ?',
      ),
      deleteSession: this.db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
      deleteSessionsForUser: this.db.prepare('DELETE FROM sessions WHERE user_id = ?'),
      deleteSessionsForUserExcept: this.db.prepare(
        'DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?',
      ),
      createReset: this.db.prepare(
        `INSERT INTO password_resets (token_hash, user_id, created_at, expires_at)
         VALUES (?, ?, ?, ?)`,
      ),
      findReset: this.db.prepare(
        'SELECT * FROM password_resets WHERE token_hash = ? AND expires_at > ?',
      ),
      deleteReset: this.db.prepare('DELETE FROM password_resets WHERE token_hash = ?'),
      deleteExpiredSessions: this.db.prepare('DELETE FROM sessions WHERE expires_at <= ?'),
      deleteExpiredResets: this.db.prepare('DELETE FROM password_resets WHERE expires_at <= ?'),
      countUsers: this.db.prepare('SELECT COUNT(*) AS count FROM users'),
      countSessions: this.db.prepare('SELECT COUNT(*) AS count FROM sessions WHERE expires_at > ?'),
      countResets: this.db.prepare(
        'SELECT COUNT(*) AS count FROM password_resets WHERE expires_at > ?',
      ),
      listUsers: this.db.prepare(
        `SELECT id, email, created_at, last_login_at, last_seen_at
         FROM users ORDER BY id DESC`,
      ),
    }
  }

  createUser(email, passwordHash, now = nowIso()) {
    const lower = String(email).trim().toLowerCase()
    const result = this.statements.insertUser.run(email, lower, passwordHash, now, now)
    return this.findUserById(Number(result.lastInsertRowid))
  }

  findUserByEmail(email) {
    return plain(this.statements.findUserByEmail.get(String(email).trim().toLowerCase()))
  }

  findUserById(id) {
    return plain(this.statements.findUserById.get(id))
  }

  touchLogin(userId, now = nowIso()) {
    return this.statements.touchLogin.run(now, now, userId).changes > 0
  }

  touchSeen(userId, now = nowIso()) {
    return this.statements.touchSeen.run(now, userId).changes > 0
  }

  setPassword(userId, passwordHash) {
    return this.statements.setPassword.run(passwordHash, userId).changes > 0
  }

  setEmail(userId, email) {
    const lower = String(email).trim().toLowerCase()
    return this.statements.setEmail.run(email, lower, userId).changes > 0
  }

  createSession(tokenHash, userId, createdAt = nowIso(), expiresAt) {
    const expires = expiresAt || new Date(Date.parse(createdAt) + 30 * 24 * 60 * 60 * 1000).toISOString()
    this.statements.createSession.run(tokenHash, userId, createdAt, createdAt, expires)
    return { token_hash: tokenHash, user_id: userId, created_at: createdAt, expires_at: expires }
  }

  findSession(tokenHash, now = nowIso()) {
    return plain(this.statements.findSession.get(tokenHash, now))
  }

  touchSession(tokenHash, seenAt = nowIso(), expiresAt) {
    const expires = expiresAt || new Date(Date.parse(seenAt) + 30 * 24 * 60 * 60 * 1000).toISOString()
    return this.statements.touchSession.run(seenAt, expires, tokenHash).changes > 0
  }

  deleteSession(tokenHash) {
    return this.statements.deleteSession.run(tokenHash).changes > 0
  }

  deleteSessionsForUser(userId, exceptTokenHash = null) {
    const statement = exceptTokenHash
      ? this.statements.deleteSessionsForUserExcept
      : this.statements.deleteSessionsForUser
    const result = exceptTokenHash
      ? statement.run(userId, exceptTokenHash)
      : statement.run(userId)
    return result.changes
  }

  createPasswordReset(tokenHash, userId, createdAt = nowIso(), expiresAt) {
    const expires = expiresAt || new Date(Date.parse(createdAt) + 24 * 60 * 60 * 1000).toISOString()
    this.statements.createReset.run(tokenHash, userId, createdAt, expires)
    return { token_hash: tokenHash, user_id: userId, created_at: createdAt, expires_at: expires }
  }

  consumePasswordReset(tokenHash, now = nowIso()) {
    this.db.exec('BEGIN IMMEDIATE')
    try {
      const row = plain(this.statements.findReset.get(tokenHash, now))
      if (row) this.statements.deleteReset.run(tokenHash)
      this.db.exec('COMMIT')
      return row
    } catch (error) {
      this.db.exec('ROLLBACK')
      throw error
    }
  }

  deleteExpired(now = nowIso()) {
    return {
      sessions: this.statements.deleteExpiredSessions.run(now).changes,
      resets: this.statements.deleteExpiredResets.run(now).changes,
    }
  }

  stats(now = nowIso()) {
    return {
      users: Number(this.statements.countUsers.get().count),
      sessions: Number(this.statements.countSessions.get(now).count),
      resets: Number(this.statements.countResets.get(now).count),
    }
  }

  listUsers() {
    return this.statements.listUsers.all().map(plain)
  }

  raw() {
    return this.db
  }

  close() {
    if (this.closed) return
    this.closed = true
    this.db.close()
  }
}

export function createDb(config) {
  return new FureverDb(config.dbPath)
}
