export type Language = 'zh' | 'en'
export type PetSource = 'own' | 'adopt'
export type PetType = 'cat' | 'dog'
export type Gender = 'male' | 'female' | 'unknown'
export type BirthMode = 'exact' | 'approx' | 'age' | 'unknown'

export interface Pet {
  id: string
  source: PetSource
  type: PetType
  name: string
  gender: Gender
  birthMode: BirthMode
  birthDate?: string
  birthMonth?: string
  ageYears?: number
  ageMonths?: number
  metAt?: string
  togetherSince?: string
  neutered: boolean
  neuterDate?: string
  neuterPlace?: string
  createdAt: string
}

export interface ChatOption {
  label: string
  value: string
}

export type InputKind =
  | 'source'
  | 'type'
  | 'name'
  | 'gender'
  | 'birthMode'
  | 'birthInput'
  | 'dates'
  | 'neutered'
  | 'neuterDetails'

export interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  text: string
  input?: InputKind
  options?: ChatOption[]
  pet?: Pet
}
