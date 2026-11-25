export function PawIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6.3" cy="10.2" r="1.5" />
      <circle cx="9.6" cy="7.2" r="1.5" />
      <circle cx="14.4" cy="7.2" r="1.5" />
      <circle cx="17.7" cy="10.2" r="1.5" />
      <path d="M12 12.9c-2.2 0-3.9 1.6-4.7 3.2-.5 1 .2 2.2 1.3 2.2 1 0 2-.6 3.4-.6s2.4.6 3.4.6c1.1 0 1.8-1.2 1.3-2.2-.8-1.6-2.5-3.2-4.7-3.2Z" />
    </svg>
  )
}
