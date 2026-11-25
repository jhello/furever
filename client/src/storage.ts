import type { Language, Pet } from './types'

export const TOKEN_KEY = 'furever.token'
export const EMAIL_KEY = 'furever.email'
export const LANGUAGE_KEY = 'furever.lang'
export const PETS_KEY = 'furever.pets'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
}

export function getSavedEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY)
}

export function setSavedEmail(email: string): void {
  localStorage.setItem(EMAIL_KEY, email)
}

export function getLanguage(): Language {
  return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'zh'
}

export function setLanguage(lang: Language): void {
  localStorage.setItem(LANGUAGE_KEY, lang)
}

export function loadPets(): Pet[] {
  try {
    const raw = localStorage.getItem(PETS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Pet[]) : []
  } catch {
    return []
  }
}

export function savePet(pet: Pet): void {
  localStorage.setItem(PETS_KEY, JSON.stringify([...loadPets(), pet]))
}

export function clearPets(): void {
  localStorage.removeItem(PETS_KEY)
}
