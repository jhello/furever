import { useNavigate } from 'react-router-dom'
import { LanguageToggle } from '../components/LanguageToggle'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n'

export function SettingsPage() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="app-page">
      <PageHeader title={t('settings')} right={<LanguageToggle />} />

      <main className="settings-content">
        <section className="settings-section">
          <p className="settings-account">{user}</p>
          <button className="settings-item" type="button" onClick={() => navigate('/settings/account')}>
            <span className="settings-item-icon">🔒</span>
            <span className="settings-item-text">
              <strong>{t('accountSecurity')}</strong>
              <small>{t('accountSecurityDesc')}</small>
            </span>
            <span className="chevron">›</span>
          </button>
          <button className="settings-item" type="button" onClick={() => navigate('/settings/about')}>
            <span className="settings-item-icon">ⓘ</span>
            <span className="settings-item-text">
              <strong>{t('about')}</strong>
            </span>
            <span className="chevron">›</span>
          </button>
        </section>

        <button
          className="secondary-button danger"
          type="button"
          onClick={async () => {
            await logout()
            navigate('/auth', { replace: true })
          }}
        >
          {t('logout')}
        </button>
      </main>
    </div>
  )
}
