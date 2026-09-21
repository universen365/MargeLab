import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const styles: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-white hover:brightness-110 disabled:opacity-50',
  secondary:
    'bg-[var(--accent-soft)] text-[var(--accent)] hover:brightness-95 disabled:opacity-50',
  danger: 'bg-[var(--danger)] text-white hover:brightness-110 disabled:opacity-50',
  ghost:
    'bg-transparent text-[var(--muted)] hover:bg-black/5 disabled:opacity-50',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-base font-semibold transition ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
