import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LanguageToggle } from '../components/LanguageToggle'
import { PawIcon } from '../components/PawIcon'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n'

type Mode = 'login' | 'register'

export function AuthPage() {
  const { t } = useLanguage()
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t('invalidEmail'))
      return
    }
    if (password.length < 6) {
      setError(t('passwordMin'))
      return
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        await login(email.trim(), password)
      } else {
        await register(email.trim(), password)
      }
      navigate('/', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <LanguageToggle />
      </div>

      <main className="auth-card">
        <div className="brand">
          <span className="brand-icon">
            <PawIcon size={34} />
          </span>
          <p>{t('englishName')} · {t('tagline')}</p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login')
              setError('')
            }}
          >
            {t('login')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={mode === 'register' ? 'active' : ''}
            onClick={() => {
              setMode('register')
              setError('')
            }}
          >
            {t('register')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <label>
            <span>{t('email')}</span>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
            />
          </label>
          <label>
            <span>{t('password')}</span>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('passwordHint')}
              minLength={6}
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? t('sending') : mode === 'login' ? t('loginAction') : t('registerAction')}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? t('noAccount') : t('haveAccount')}{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
          >
            {mode === 'login' ? t('goRegister') : t('goLogin')}
          </button>
        </p>
      </main>
    </div>
  )
}
