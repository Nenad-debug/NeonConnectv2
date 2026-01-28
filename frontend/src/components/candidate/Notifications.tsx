import { Bell, MessageSquare, Briefcase, CheckCircle } from 'lucide-react'

interface Notification {
  id: string
  type: 'job_match' | 'message' | 'status_change' | 'company_follow'
  title: string
  description: string
  created_at: string
  read: boolean
  icon?: any
}

interface NotificationsProps {
  notifications: Notification[]
  loading?: boolean
}

const notificationConfig = {
  job_match: {
    icon: Briefcase,
    color: 'bg-emerald-500/20 text-emerald-300',
    label: 'Novi posao'
  },
  message: {
    icon: MessageSquare,
    color: 'bg-blue-500/20 text-blue-300',
    label: 'Poruka'
  },
  status_change: {
    icon: CheckCircle,
    color: 'bg-purple-500/20 text-purple-300',
    label: 'Promena statusa'
  },
  company_follow: {
    icon: Briefcase,
    color: 'bg-yellow-500/20 text-yellow-300',
    label: 'Kompanija vas prati'
  }
}

export default function Notifications({ notifications, loading }: NotificationsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-12 text-center space-y-4">
          <Bell className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-slate-300 text-lg">Nemaš notifikacija</p>
          <p className="text-slate-500 text-sm">Sve je tiho - nastavimo sa pretraživanjem</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.slice(0, 5).map((notif) => {
        const config = notificationConfig[notif.type]
        const Icon = config.icon
        
        return (
          <div key={notif.id} className="group relative">
            {/* Gradient border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Card */}
            <div className={`relative bg-slate-900/80 backdrop-blur-xl border ${notif.read ? 'border-slate-700/50' : 'border-blue-500/50'} rounded-lg p-4 transition-all duration-300`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.color} flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">{notif.title}</h4>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-1">{notif.description}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(notif.created_at).toLocaleDateString('sr-RS')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {notifications.length > 5 && (
        <button className="w-full py-2 text-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Pogledaj sve notifikacije ({notifications.length})
        </button>
      )}
    </div>
  )
}
