import { getToken } from './storage'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('无法连接服务器，请检查服务端是否已启动', 0, 'NETWORK_ERROR')
  }

  const data = (await response.json().catch(() => ({}))) as {
    message?: string
    error?: string
  } & T

  if (!response.ok) {
    throw new ApiError(data.message || '请求失败', response.status, data.error)
  }

  return data as T
}

interface AuthResult {
  token: string
  email: string
}

interface MessageResult {
  ok?: boolean
  message?: string
  email?: string
  resetToken?: string | null
  expiresAt?: string
}

export const api = {
  register: (email: string, password: string) =>
    request<AuthResult>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResult>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ email: string }>('/api/auth/me'),

  logout: () => request<MessageResult>('/api/auth/logout', { method: 'POST' }),

  changeEmail: (newEmail: string, password: string) =>
    request<MessageResult>('/api/account/change-email', {
      method: 'POST',
      body: JSON.stringify({ newEmail, password }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<MessageResult>('/api/account/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  forgotPassword: (email: string) =>
    request<MessageResult>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (resetToken: string, newPassword: string) =>
    request<MessageResult>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    }),
}
