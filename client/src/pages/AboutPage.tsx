import { PawIcon } from '../components/PawIcon'
import { useLanguage } from '../i18n'

export function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="app-page">
      <main className="settings-content about-content">
        <div className="about-brand">
          <PawIcon size={44} />
          <p>{t('aboutDescription')}</p>
        </div>
        <dl className="about-list">
          <div>
            <dt>{t('version')}</dt>
            <dd>0.1.0</dd>
          </div>
          <div>
            <dt>{t('localData')}</dt>
            <dd>localStorage</dd>
          </div>
          <div>
            <dt>{t('serverInfo')}</dt>
            <dd>Express API</dd>
          </div>
        </dl>
      </main>
    </div>
  )
}
