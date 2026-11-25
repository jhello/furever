import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { PawIcon } from './PawIcon'

export function SettingsButton() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  return (
    <button
      className="icon-button"
      type="button"
      onClick={() => navigate('/settings')}
      aria-label={t('settings')}
      title={t('settings')}
    >
      <PawIcon />
    </button>
  )
}
