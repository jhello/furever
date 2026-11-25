import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './i18n'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { ChatPage } from './pages/ChatPage'
import { SettingsPage } from './pages/SettingsPage'
import { AccountSecurityPage } from './pages/AccountSecurityPage'
import { ChangeEmailPage, ChangePasswordPage, ForgotPasswordPage } from './pages/AccountForms'
import { AboutPage } from './pages/AboutPage'
import { useNativeNavigation } from './hooks/useNativeNavigation'

function AuthRoute() {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : <AuthPage />
}

function ProtectedRoute() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="center-screen">
        <p>{t('loading')}</p>
      </div>
    )
  }
  return user ? <Outlet /> : <Navigate to="/auth" replace />
}

export default function App() {
  useNativeNavigation()

  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/account" element={<AccountSecurityPage />} />
              <Route path="/settings/account/email" element={<ChangeEmailPage />} />
              <Route path="/settings/account/password" element={<ChangePasswordPage />} />
              <Route path="/settings/account/forgot" element={<ForgotPasswordPage />} />
              <Route path="/settings/about" element={<AboutPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
