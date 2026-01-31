import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className={`relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6 ${className}`}>
        {children}
      </div>
    </div>
  )
}
