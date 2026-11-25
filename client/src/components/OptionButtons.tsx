import type { ChatOption } from '../types'

interface OptionButtonsProps {
  options: ChatOption[]
  onSelect: (value: string) => void
}

export function OptionButtons({ options, onSelect }: OptionButtonsProps) {
  return (
    <div className="option-buttons">
      {options.map((option) => (
        <button key={option.value} type="button" className="option-button" onClick={() => onSelect(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  )
}
