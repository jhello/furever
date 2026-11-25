import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n'

function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback
}

export function ChangeEmailPage() {
  const { t } = useLanguage()
  const { updateEmail } = useAuth()
  const [newEmail, setNewEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const result = await api.changeEmail(newEmail.trim(), password)
      updateEmail(result.email || newEmail.trim())
      setMessage(t('emailChanged'))
      setIsError(false)
      setNewEmail('')
      setPassword('')
    } catch (cause) {
      setMessage(errorMessage(cause, t('error')))
      setIsError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-page">
      <PageHeader title={t('changeEmail')} />
      <main className="settings-content">
        <form className="form card-form" onSubmit={handleSubmit}>
          <label>
            <span>{t('newEmail')}</span>
            <input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} autoComplete="email" required />
          </label>
          <label>
            <span>{t('currentPassword')}</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </label>
          <FormMessage message={message} isError={isError} />
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? t('sending') : t('submit')}
          </button>
        </form>
      </main>
    </div>
  )
}

export function ChangePasswordPage() {
  const { t } = useLanguage()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await api.changePassword(currentPassword, newPassword)
      setMessage(t('passwordChanged'))
      setIsError(false)
      setCurrentPassword('')
      setNewPassword('')
    } catch (cause) {
      setMessage(errorMessage(cause, t('error')))
      setIsError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-page">
      <PageHeader title={t('changePassword')} />
      <main className="settings-content">
        <form className="form card-form" onSubmit={handleSubmit}>
          <label>
            <span>{t('currentPassword')}</span>
            <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required />
          </label>
          <label>
            <span>{t('newPassword')}</span>
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={6} required />
          </label>
          <FormMessage message={message} isError={isError} />
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? t('sending') : t('submit')}
          </button>
        </form>
      </main>
    </div>
  )
}

export function ForgotPasswordPage() {
  const { t } = useLanguage()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const [stage, setStage] = useState<'request' | 'reset'>('request')

  async function handleRequest(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const result = await api.forgotPassword(email.trim())
      setMessage(result.message || t('forgotHint'))
      setIsError(false)
      setResetDone(false)
      if (result.resetToken) {
        setToken(result.resetToken)
        setStage('reset')
      }
    } catch (cause) {
      setMessage(errorMessage(cause, t('error')))
      setIsError(true)
    } finally {
      setBusy(false)
    }
  }

  async function handleReset(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await api.resetPassword(token, newPassword)
      setMessage(t('passwordReset'))
      setIsError(false)
      setResetDone(true)
    } catch (cause) {
      setMessage(errorMessage(cause, t('error')))
      setIsError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-page">
      <PageHeader title={t('forgotPassword')} />
      <main className="settings-content">
        <p className="hint">{t('forgotHint')}</p>
        {stage === 'request' ? (
          <form className="form card-form" onSubmit={handleRequest}>
            <label>
              <span>{t('email')}</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </label>
            <FormMessage message={message} isError={isError} />
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? t('sending') : t('submit')}
            </button>
          </form>
        ) : (
          <form className="form card-form" onSubmit={handleReset}>
            <label>
              <span>{t('resetToken')}</span>
              <textarea value={token} onChange={(event) => setToken(event.target.value)} rows={3} required />
            </label>
            <label>
              <span>{t('newPassword')}</span>
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={6} required />
            </label>
            <FormMessage message={message} isError={isError} />
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? t('sending') : t('submit')}
            </button>
            {resetDone && !isError && (
              <button
                className="secondary-button"
                type="button"
                onClick={async () => {
                  await logout()
                  navigate('/auth', { replace: true })
                }}
              >
                {t('goLogin')}
              </button>
            )}
          </form>
        )}
      </main>
    </div>
  )
}

function FormMessage({ message, isError }: { message: string; isError: boolean }) {
  if (!message) return null
  return <p className={isError ? 'form-error' : 'form-success'}>{message}</p>
}
