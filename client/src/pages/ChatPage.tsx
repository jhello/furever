import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { OptionButtons } from '../components/OptionButtons'
import { PageHeader } from '../components/PageHeader'
import { PawIcon } from '../components/PawIcon'
import { SettingsButton } from '../components/SettingsButton'
import { useLanguage } from '../i18n'
import { loadPets, savePet } from '../storage'
import type { BirthMode, ChatMessage, ChatOption, Gender, InputKind, Pet, PetSource, PetType } from '../types'

interface Draft {
  source: PetSource | ''
  type: PetType | ''
  name: string
  gender: Gender | ''
  birthMode: BirthMode
  birthDate: string
  birthMonth: string
  ageYears: string
  ageMonths: string
  metAt: string
  togetherSince: string
  neutered: boolean | undefined
  neuterDate: string
  neuterPlace: string
}

const emptyDraft: Draft = {
  source: '',
  type: '',
  name: '',
  gender: '',
  birthMode: 'exact',
  birthDate: '',
  birthMonth: '',
  ageYears: '',
  ageMonths: '',
  metAt: '',
  togetherSince: '',
  neutered: undefined,
  neuterDate: '',
  neuterPlace: '',
}

let sequence = 0
function uid(): string {
  sequence += 1
  return `${Date.now()}-${sequence}`
}

type Translate = (key: string) => string

function sourceLabel(pet: Pet, t: Translate): string {
  return pet.source === 'own' ? t('sourceOwn') : t('sourceAdopt')
}

function typeLabel(pet: Pet, t: Translate): string {
  return pet.type === 'cat' ? t('optCat') : t('optDog')
}

function genderLabel(value: Gender | '', t: Translate): string {
  if (value === 'male') return t('optMale')
  if (value === 'female') return t('optFemale')
  return t('optUnknown')
}

function birthLabel(pet: Pet, t: Translate): string {
  if (pet.birthMode === 'exact') return pet.birthDate || t('notProvided')
  if (pet.birthMode === 'approx') return pet.birthMonth || t('notProvided')
  if (pet.birthMode === 'age') {
    const parts: string[] = []
    if (pet.ageYears) parts.push(`${pet.ageYears}${t('ageYears')}`)
    if (pet.ageMonths) parts.push(`${pet.ageMonths}${t('ageMonths')}`)
    return parts.join(' ') || t('notProvided')
  }
  return t('birthUnknown')
}

function ageAnswer(years: string, months: string, t: Translate): string {
  const parts: string[] = []
  if (years) parts.push(`${years}${t('ageYears')}`)
  if (months) parts.push(`${months}${t('ageMonths')}`)
  return parts.join(' ') || t('birthUnknown')
}

function ProfileCard({ pet, t }: { pet: Pet; t: Translate }) {
  const rows: Array<[string, string]> = [
    [t('source'), sourceLabel(pet, t)],
    [t('type'), typeLabel(pet, t)],
    [t('gender'), genderLabel(pet.gender, t)],
    [t('birth'), birthLabel(pet, t)],
    [t('met'), pet.metAt || t('notProvided')],
    [t('together'), pet.togetherSince || t('notProvided')],
    [
      t('neuter'),
      pet.neutered
        ? [t('optYes'), pet.neuterDate, pet.neuterPlace].filter(Boolean).join(' · ')
        : t('optNo'),
    ],
  ]

  return (
    <div className="profile-card">
      <div className="profile-card-title">
        <span className="profile-emoji">{pet.type === 'cat' ? '🐱' : '🐶'}</span>
        <div>
          <strong>{pet.name}</strong>
          <small>{t('petProfile')} · {t('savedDetail')}</small>
        </div>
      </div>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function ChatPage() {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const draftRef = useRef<Draft>({ ...emptyDraft })
  const [textValue, setTextValue] = useState('')
  const [birthMode, setBirthMode] = useState<BirthMode>('exact')
  const [birthForm, setBirthForm] = useState({ date: '', month: '', years: '', months: '' })
  const [datesForm, setDatesForm] = useState({ metAt: '', togetherSince: '' })
  const [neuterForm, setNeuterForm] = useState({ date: '', place: '' })
  const endRef = useRef<HTMLDivElement>(null)

  function assistant(text: string, input?: InputKind, options?: ChatOption[]): ChatMessage {
    return {
      id: uid(),
      role: 'assistant',
      text,
      ...(input ? { input } : {}),
      ...(options ? { options } : {}),
    }
  }

  function sourceOptions(): ChatOption[] {
    return [
      { label: t('optOwn'), value: 'own' },
      { label: t('optAdopt'), value: 'adopt' },
    ]
  }

  useEffect(() => {
    const pets = loadPets()
    if (pets.length) {
      setMessages([assistant(t('welcome')), { ...assistant(t('savedDetail')), pet: pets[pets.length - 1] }])
    } else {
      setMessages([assistant(t('qSource'), 'source', sourceOptions())])
    }
    // 初始化只执行一次，避免切换语言时重置聊天记录。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  function commit(userText: string, patch: Partial<Draft>, next?: ChatMessage) {
    draftRef.current = { ...draftRef.current, ...patch }
    setMessages((previous) => {
      const locked = previous.map((message, index) =>
        index === previous.length - 1 && message.role === 'assistant'
          ? { ...message, input: undefined, options: undefined }
          : message,
      )
      const updated = [...locked, { id: uid(), role: 'user' as const, text: userText }]
      if (next) updated.push(next)
      return updated
    })
  }

  function finish(userText: string, patch: Partial<Draft>) {
    const draft = { ...draftRef.current, ...patch }
    const pet: Pet = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : uid(),
      source: (draft.source || 'own') as PetSource,
      type: (draft.type || 'cat') as PetType,
      name: draft.name,
      gender: (draft.gender || 'unknown') as Gender,
      birthMode: draft.birthMode,
      ...(draft.birthDate ? { birthDate: draft.birthDate } : {}),
      ...(draft.birthMonth ? { birthMonth: draft.birthMonth } : {}),
      ...(draft.ageYears ? { ageYears: Number(draft.ageYears) } : {}),
      ...(draft.ageMonths ? { ageMonths: Number(draft.ageMonths) } : {}),
      ...(draft.metAt ? { metAt: draft.metAt } : {}),
      ...(draft.togetherSince ? { togetherSince: draft.togetherSince } : {}),
      neutered: draft.neutered === true,
      ...(draft.neuterDate ? { neuterDate: draft.neuterDate } : {}),
      ...(draft.neuterPlace ? { neuterPlace: draft.neuterPlace } : {}),
      createdAt: new Date().toISOString(),
    }
    savePet(pet)

    draftRef.current = { ...emptyDraft }
    setTextValue('')
    setBirthForm({ date: '', month: '', years: '', months: '' })
    setDatesForm({ metAt: '', togetherSince: '' })
    setNeuterForm({ date: '', place: '' })

    setMessages((previous) => {
      const locked = previous.map((message, index) =>
        index === previous.length - 1 && message.role === 'assistant'
          ? { ...message, input: undefined, options: undefined }
          : message,
      )
      return [
        ...locked,
        { id: uid(), role: 'user', text: userText },
        { ...assistant(t('saved')), pet },
      ]
    })
  }

  function handleSource(value: string) {
    const source = value as PetSource
    commit(source === 'own' ? t('optOwn') : t('optAdopt'), { source }, assistant(t('qType'), 'type', [
      { label: t('optCat'), value: 'cat' },
      { label: t('optDog'), value: 'dog' },
    ]))
  }

  function handleType(value: string) {
    const type = value as PetType
    commit(type === 'cat' ? t('optCat') : t('optDog'), { type }, assistant(t('qName'), 'name'))
  }

  function handleNameSubmit(event: FormEvent) {
    event.preventDefault()
    const name = textValue.trim()
    if (!name) return
    setTextValue('')
    commit(name, { name }, assistant(t('qGender'), 'gender', [
      { label: t('optMale'), value: 'male' },
      { label: t('optFemale'), value: 'female' },
      { label: t('optUnknown'), value: 'unknown' },
    ]))
  }

  function handleGender(value: string) {
    const gender = value as Gender
    commit(genderLabel(gender, t), { gender }, assistant(t('qBirthMode'), 'birthMode', [
      { label: t('birthExact'), value: 'exact' },
      { label: t('birthApprox'), value: 'approx' },
      { label: t('birthAge'), value: 'age' },
      { label: t('birthUnknown'), value: 'unknown' },
    ]))
  }

  function handleBirthMode(value: string) {
    const mode = value as BirthMode
    setBirthMode(mode)
    const label =
      mode === 'exact' ? t('birthExact') : mode === 'approx' ? t('birthApprox') : mode === 'age' ? t('birthAge') : t('birthUnknown')
    const question =
      mode === 'exact'
        ? t('birthExactLabel')
        : mode === 'approx'
          ? t('birthApproxLabel')
          : mode === 'age'
            ? `${t('ageYears')} / ${t('ageMonths')}`
            : t('birthUnknownHint')
    commit(label, { birthMode: mode }, assistant(question, 'birthInput'))
  }

  function handleBirthInput() {
    const patch: Partial<Draft> = {}
    let answer = ''
    if (birthMode === 'exact') {
      if (!birthForm.date) return
      patch.birthDate = birthForm.date
      answer = birthForm.date
    } else if (birthMode === 'approx') {
      if (!birthForm.month) return
      patch.birthMonth = birthForm.month
      answer = birthForm.month
    } else if (birthMode === 'age') {
      if (!birthForm.years && !birthForm.months) return
      patch.ageYears = birthForm.years
      patch.ageMonths = birthForm.months
      answer = ageAnswer(birthForm.years, birthForm.months, t)
    } else {
      answer = t('birthUnknown')
    }
    commit(answer, patch, assistant(t('qDates'), 'dates'))
  }

  function handleDates() {
    if (!datesForm.metAt || !datesForm.togetherSince) return
    commit(
      `${datesForm.metAt} / ${datesForm.togetherSince}`,
      { metAt: datesForm.metAt, togetherSince: datesForm.togetherSince },
      assistant(t('qNeutered'), 'neutered', [
        { label: t('optYes'), value: 'yes' },
        { label: t('optNo'), value: 'no' },
      ]),
    )
  }

  function handleNeutered(value: string) {
    if (value === 'no') {
      finish(t('optNo'), { neutered: false })
      return
    }
    commit(t('optYes'), { neutered: true }, assistant(t('qNeuterDetails'), 'neuterDetails'))
  }

  function handleNeuterDetails() {
    const parts = [neuterForm.date, neuterForm.place].filter(Boolean)
    finish(parts.join(' · ') || t('notProvided'), {
      neuterDate: neuterForm.date,
      neuterPlace: neuterForm.place,
    })
  }

  function addAnother() {
    draftRef.current = { ...emptyDraft }
    setMessages((previous) => [...previous, assistant(t('qSource'), 'source', sourceOptions())])
  }

  const lastMessage = messages[messages.length - 1]

  function renderInteractive(message: ChatMessage) {
    if (lastMessage?.id !== message.id || !message.input) return null

    switch (message.input) {
      case 'source':
        return <OptionButtons options={message.options ?? sourceOptions()} onSelect={handleSource} />
      case 'type':
        return (
          <OptionButtons
            options={[
              { label: t('optCat'), value: 'cat' },
              { label: t('optDog'), value: 'dog' },
            ]}
            onSelect={handleType}
          />
        )
      case 'gender':
        return (
          <OptionButtons
            options={[
              { label: t('optMale'), value: 'male' },
              { label: t('optFemale'), value: 'female' },
              { label: t('optUnknown'), value: 'unknown' },
            ]}
            onSelect={handleGender}
          />
        )
      case 'birthMode':
        return (
          <OptionButtons
            options={[
              { label: t('birthExact'), value: 'exact' },
              { label: t('birthApprox'), value: 'approx' },
              { label: t('birthAge'), value: 'age' },
              { label: t('birthUnknown'), value: 'unknown' },
            ]}
            onSelect={handleBirthMode}
          />
        )
      case 'birthInput':
        return (
          <div className="inline-form">
            {birthMode === 'exact' && (
              <label>
                <span>{t('birthExactLabel')}</span>
                <input
                  type="date"
                  value={birthForm.date}
                  onChange={(event) => setBirthForm({ ...birthForm, date: event.target.value })}
                />
              </label>
            )}
            {birthMode === 'approx' && (
              <label>
                <span>{t('birthApproxLabel')}</span>
                <input
                  type="month"
                  value={birthForm.month}
                  onChange={(event) => setBirthForm({ ...birthForm, month: event.target.value })}
                />
              </label>
            )}
            {birthMode === 'age' && (
              <div className="inline-row">
                <label>
                  <span>{t('ageYears')}</span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={birthForm.years}
                    onChange={(event) => setBirthForm({ ...birthForm, years: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t('ageMonths')}</span>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={birthForm.months}
                    onChange={(event) => setBirthForm({ ...birthForm, months: event.target.value })}
                  />
                </label>
              </div>
            )}
            <button
              type="button"
              className="primary-button small"
              onClick={handleBirthInput}
              disabled={birthMode === 'exact' && !birthForm.date ? true : birthMode === 'approx' && !birthForm.month ? true : birthMode === 'age' && !birthForm.years && !birthForm.months}
            >
              {birthMode === 'unknown' ? t('next') : t('confirm')}
            </button>
          </div>
        )
      case 'dates':
        return (
          <div className="inline-form">
            <label>
              <span>{t('metAtLabel')}</span>
              <input
                type="date"
                value={datesForm.metAt}
                onChange={(event) => setDatesForm({ ...datesForm, metAt: event.target.value })}
              />
            </label>
            <label>
              <span>{t('togetherSinceLabel')}</span>
              <input
                type="date"
                value={datesForm.togetherSince}
                onChange={(event) => setDatesForm({ ...datesForm, togetherSince: event.target.value })}
              />
            </label>
            <button
              type="button"
              className="primary-button small"
              onClick={handleDates}
              disabled={!datesForm.metAt || !datesForm.togetherSince}
            >
              {t('confirm')}
            </button>
          </div>
        )
      case 'neutered':
        return (
          <OptionButtons
            options={[
              { label: t('optYes'), value: 'yes' },
              { label: t('optNo'), value: 'no' },
            ]}
            onSelect={handleNeutered}
          />
        )
      case 'neuterDetails':
        return (
          <div className="inline-form">
            <label>
              <span>{t('neuterDateLabel')}</span>
              <input
                type="date"
                value={neuterForm.date}
                onChange={(event) => setNeuterForm({ ...neuterForm, date: event.target.value })}
              />
            </label>
            <label>
              <span>{t('neuterPlaceLabel')}</span>
              <input
                type="text"
                value={neuterForm.place}
                onChange={(event) => setNeuterForm({ ...neuterForm, place: event.target.value })}
              />
            </label>
            <button type="button" className="primary-button small" onClick={handleNeuterDetails}>
              {t('confirm')}
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="app-page chat-page">
      <PageHeader title={t('appName')} showBack={false} right={<SettingsButton />} />

      <div className="chat-scroll">
        <div className="chat-list">
          {messages.map((message) => (
            <div key={message.id} className={`message-row ${message.role}`}>
              {message.role === 'assistant' && (
                <span className="assistant-avatar">
                  <PawIcon size={17} />
                </span>
              )}
              <div className="message-column">
                <div className="bubble">
                  <p>{message.text}</p>
                  {message.pet && <ProfileCard pet={message.pet} t={t} />}
                  {message.pet && (
                    <button type="button" className="link-button" onClick={addAnother}>
                      {t('addAnother')}
                    </button>
                  )}
                </div>
                {renderInteractive(message)}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <footer className="composer">
        {lastMessage?.input === 'name' ? (
          <form className="composer-form" onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              placeholder={t('namePlaceholder')}
              autoComplete="off"
            />
            <button type="submit" disabled={!textValue.trim()}>
              ↑
            </button>
          </form>
        ) : (
          <div className="composer-placeholder">{t('chatPlaceholder')}</div>
        )}
      </footer>
    </div>
  )
}
