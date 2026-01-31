import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'

interface AuthGuardProps {
  children: React.ReactNode
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/check-email',
  '/auth/callback',
  '/terms',
  '/privacy',
  '/jobs',
]

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        // If user is not authenticated and route is protected, redirect to login
        if (!user && !PUBLIC_ROUTES.includes(location.pathname)) {
          console.log('⚠️ [AUTH GUARD] Protecting route, redirecting to login')
          navigate('/login', { replace: true })
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // Don't redirect on error if public route
        if (!PUBLIC_ROUTES.includes(location.pathname)) {
          navigate('/login', { replace: true })
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        // Only redirect if on protected route
        if (!PUBLIC_ROUTES.includes(location.pathname)) {
          navigate('/login', { replace: true })
        }
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [navigate, location.pathname])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-slate-300">Učitavanje...</div>
      </div>
    )
  }

  return <>{children}</>
}
