import React from 'react'

const iconClass = 'flex-shrink-0'

function Grad({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#38bdf8" />
      <stop offset="50%" stopColor="#3b82f6" />
      <stop offset="100%" stopColor="#6366f1" />
    </linearGradient>
  )
}

export function IconProfileDocument({ className = 'w-12 h-12' }: { className?: string }) {
  const id = 'home-icon-profile'
  return (
    <svg viewBox="0 0 48 48" className={`${iconClass} ${className}`} fill="none" aria-hidden>
      <defs><Grad id={id} /></defs>
      <rect x="8" y="4" width="24" height="32" rx="2" ry="2" stroke={`url(#${id})`} strokeWidth="3" fill="none" />
      <line x1="14" y1="12" x2="26" y2="12" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="14" y1="18" x2="26" y2="18" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="14" y1="24" x2="22" y2="24" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconSearch({ className = 'w-12 h-12' }: { className?: string }) {
  const id = 'home-icon-search'
  return (
    <svg viewBox="0 0 48 48" className={`${iconClass} ${className}`} fill="none" aria-hidden>
      <defs><Grad id={id} /></defs>
      <circle cx="22" cy="22" r="10" stroke={`url(#${id})`} strokeWidth="3" fill="none" />
      <line x1="32" y1="32" x2="42" y2="42" stroke={`url(#${id})`} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function IconTrophy({ className = 'w-12 h-12' }: { className?: string }) {
  const id = 'home-icon-trophy'
  return (
    <svg viewBox="0 0 48 48" className={`${iconClass} ${className}`} fill="none" aria-hidden>
      <defs><Grad id={id} /></defs>
      <path d="M12 8h24v8c0 6-3 10-12 10s-12-4-12-10V8z" stroke={`url(#${id})`} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      <path d="M24 26v8M18 34h12" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 42h16M20 42v4h8v-4" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 8V4M24 4h6M24 4h-6" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="24" cy="20" rx="8" ry="4" stroke={`url(#${id})`} strokeWidth="2" fill="none" />
    </svg>
  )
}

export function IconCode({ className = 'w-8 h-8' }: { className?: string }) {
  const id = 'home-icon-code'
  return (
    <svg viewBox="0 0 32 32" className={`${iconClass} ${className}`} fill="none" aria-hidden>
      <defs><Grad id={id} /></defs>
      <path d="M10 10L6 16l4 6M22 10l4 6-4 6M19 6L13 26" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconGear({ className = 'w-8 h-8' }: { className?: string }) {
  const id = 'home-icon-gear'
  return (
    <svg viewBox="0 0 32 32" className={`${iconClass} ${className}`} fill="none" aria-hidden>
      <defs><Grad id={id} /></defs>
      <path d="M16 10a4 4 0 110 8 4 4 0 010-8z" stroke={`url(#${id})`} strokeWidth="2" fill="none" />
      <path d="M16 4v2M16 26v2M8 16H6M26 16h-2M22.5 9.5l-1.4 1.4M11 21l-1.4 1.4M22.5 22.5l-1.4-1.4M11 11l-1.4-1.4" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M16 18a2 2 0 100-4 2 2 0 000 4z" fill={`url(#${id})`} />
    </svg>
  )
}

export function IconSparkle({ className = 'w-8 h-8' }: { className?: string }) {
  const id = 'home-icon-sparkle'
  return (
    <svg viewBox="0 0 32 32" className={`${iconClass} ${className}`} fill="none" aria-hidden>
      <defs><Grad id={id} /></defs>
      <path d="M16 4l2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8z" stroke={`url(#${id})`} strokeWidth="2" strokeLinejoin="round" fill="none" />
      <path d="M8 20l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" stroke={`url(#${id})`} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
