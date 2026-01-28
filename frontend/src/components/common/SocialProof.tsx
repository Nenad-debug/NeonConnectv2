import { useEffect, useState } from 'react'
import { statsService } from '../../services/statsService'

export default function SocialProof() {
  const [activeUsers, setActiveUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const data = await statsService.getStats()
        setActiveUsers(data.activeUsers)
      } catch (error) {
        console.error('Failed to fetch users:', error)
        setActiveUsers(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()

    // Refresh every 30 seconds
    const interval = setInterval(fetchUsers, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-6 pt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
      <div className="flex -space-x-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-slate-900 flex items-center justify-center text-sm font-bold">
            {i + 1}
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-300">
        <span className={`font-semibold text-white transition-opacity duration-300 ${isLoading ? 'opacity-75' : 'opacity-100'}`}>
          {activeUsers > 0 ? activeUsers + '+' : '0'}
        </span> korisnika koristi NeonConnect
      </p>
    </div>
  )
}
