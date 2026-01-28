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

  const statItems = [
    { 
      number: stats.activeUsers.toString() || '5000+', 
      label: 'Aktivnih korisnika' 
    },
    { 
      number: stats.activeJobs.toString() || '800+', 
      label: 'Otvorenih poslova' 
    },
    { 
      number: stats.verifiedCompanies.toString() || '150+', 
      label: 'Verifikovanih kompanija' 
    },
  ]

  return (
    <section className="py-20 px-4 bg-slate-800/30 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center justify-items-center">
          {statItems.map((stat, idx) => (
            <div 
              key={idx} 
              className={`space-y-2 transition-opacity duration-300 ${isLoading ? 'opacity-75' : 'opacity-100'}`}
            >
              <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {typeof stat.number === 'string' && stat.number.includes('%') 
                  ? stat.number 
                  : !isLoading && parseInt(stat.number) > 0
                  ? <Counter end={parseInt(stat.number)} duration={2000} />
                  : stat.number
                }
              </p>
              <p className="text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
