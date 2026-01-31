import { useEffect, useState } from 'react'
import { statsService } from '../../services/statsService'
import Counter from './Counter'

interface Stats {
  activeUsers: number
  activeJobs: number
  verifiedCompanies: number
  satisfactionRate: number
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stats>({
    activeUsers: 0,
    activeJobs: 0,
    verifiedCompanies: 0,
    satisfactionRate: 92,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const data = await statsService.getStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    // Refresh stats every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const displayValue = (raw: number, fallback: string) =>
    !isLoading && raw > 0 ? raw : fallback

  const statItems = [
    { raw: stats.activeUsers, number: displayValue(stats.activeUsers, '5000+'), label: 'Aktivnih korisnika' },
    { raw: stats.activeJobs, number: displayValue(stats.activeJobs, '800+'), label: 'Otvorenih poslova' },
    { raw: stats.verifiedCompanies, number: displayValue(stats.verifiedCompanies, '150+'), label: 'Verifikovanih kompanija' },
  ]

  return (
    <section className="py-14 sm:py-16 px-4 relative overflow-hidden">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-slate-400 text-sm font-medium uppercase tracking-widest mb-10">
          Platforma u brojevima
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {statItems.map((stat, idx) => (
            <div
              key={idx}
              className={`relative rounded-xl bg-gradient-to-b from-slate-800/50 to-slate-900/40 border border-slate-700/50 px-6 py-8 text-center transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_-8px_rgba(59,130,246,0.25)] ${isLoading ? 'opacity-80' : 'opacity-100'}`}
            >
              <p className="text-4xl sm:text-5xl font-extrabold tabular-nums bg-gradient-to-b from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                {typeof stat.number === 'string' && stat.number.includes('+')
                  ? stat.number
                  : !isLoading && stat.raw > 0
                  ? <Counter end={stat.raw} duration={2000} />
                  : stat.number}
              </p>
              <p className="mt-2 text-slate-400 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
    </section>
  )
}
