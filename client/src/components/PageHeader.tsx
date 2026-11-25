import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n'

interface PageHeaderProps {
  title: string
  right?: ReactNode
  showBack?: boolean
}

export function PageHeader({ title, right, showBack = true }: PageHeaderProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <header className="topbar">
      <div className="topbar-left">
        {showBack && (
          <button className="icon-button ghost" type="button" onClick={() => navigate(-1)} aria-label={t('back')}>
            ←
          </button>
        )}
        <h1>{title}</h1>
      </div>
      <div className="topbar-right">{right}</div>
    </header>
  )
}
