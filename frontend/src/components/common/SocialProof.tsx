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
    <div className="flex items-center gap-4 text-sm text-slate-300">
      <div className="flex -space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-medium text-slate-300"
          >
            {i + 1}
          </div>
        ))}
      </div>
      <p>
        <span className={`font-semibold text-white transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          {activeUsers > 0 ? activeUsers + '+' : '0'}
        </span> koristi NeonConnect
      </p>
    </div>
  )
}
