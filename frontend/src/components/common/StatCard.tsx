import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  Icon?: any
  accent?: string
}

export default function StatCard({ label, value, Icon, accent = 'from-blue-600' }: StatCardProps) {
  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${accent} to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block`} />
      <div className="relative bg-slate-900/80 border border-slate-700/50 rounded-lg p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
          {Icon ? <Icon className="w-6 h-6 text-blue-300" /> : null}
        </div>
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}
