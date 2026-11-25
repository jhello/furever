import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useLanguage } from '../i18n'

export function AccountSecurityPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const items = [
    { label: t('changeEmail'), path: '/settings/account/email' },
    { label: t('changePassword'), path: '/settings/account/password' },
    { label: t('forgotPassword'), path: '/settings/account/forgot' },
  ]

  return (
    <div className="app-page">
      <PageHeader title={t('accountSecurity')} />
      <main className="settings-content">
        <section className="settings-section">
          {items.map((item) => (
            <button key={item.path} className="settings-item simple" type="button" onClick={() => navigate(item.path)}>
              <span className="settings-item-text">
                <strong>{item.label}</strong>
              </span>
              <span className="chevron">›</span>
            </button>
          ))}
        </section>
      </main>
    </div>
  )
}
