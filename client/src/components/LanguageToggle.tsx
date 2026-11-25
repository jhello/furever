import { useLanguage } from '../i18n'

export function LanguageToggle() {
  const { lang, toggle } = useLanguage()
  return (
    <button className="language-toggle" type="button" onClick={toggle} aria-label="Switch language">
      <span aria-hidden="true">🌐</span> {lang === 'zh' ? 'EN' : '中'}
    </button>
  )
}
