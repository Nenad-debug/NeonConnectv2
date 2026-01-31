import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // User is not authenticated
          navigate('/', { replace: true })
        }
      } catch (error) {
        console.error('Auth check error:', error)
        navigate('/', { replace: true })
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/', { replace: true })
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-slate-300">Učitavanje...</div>
      </div>
    )
  }

  return <>{children}</>
}
