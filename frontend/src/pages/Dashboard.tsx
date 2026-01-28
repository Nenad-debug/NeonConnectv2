import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          navigate('/login')
        } else {
          setUser(currentUser)
        }
      } catch (err) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-gray-600">Učitavanje...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">Dobrodošao/la, {user?.email}</p>
    </div>
  )
}
