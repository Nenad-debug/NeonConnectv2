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
    color: 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60 shadow-lg shadow-emerald-500/20',
    label: '💼 Novi posao'
  },
  message: {
    icon: MessageSquare,
    color: 'bg-blue-500/30 text-blue-300 border border-blue-500/60 shadow-lg shadow-blue-500/20',
    label: '💬 Poruka'
  },
  status_change: {
    icon: CheckCircle,
    color: 'bg-purple-500/30 text-purple-300 border border-purple-500/60 shadow-lg shadow-purple-500/20',
    label: '✅ Promena statusa'
  },
  company_follow: {
    icon: Briefcase,
    color: 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/60 shadow-lg shadow-yellow-500/20',
    label: '⭐ Kompanija vas prati'
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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-950/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 text-center space-y-3">
          <Bell className="w-12 h-12 text-purple-400/50 mx-auto animate-bounce" />
          <p className="text-purple-300 text-base font-bold">Nemaš notifikacija</p>
          <p className="text-slate-400 text-sm">Sve je tiho - nastavimo sa pretraživanjem</p>
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
            {/* Neon glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            
            {/* Card */}
            <div className={`relative bg-slate-900/60 backdrop-blur-xl border ${notif.read ? 'border-slate-700/50' : 'border-purple-500/60'} rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20`}>
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg ${config.color} flex-shrink-0 font-bold`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-white text-sm">{notif.title}</h4>
                    {!notif.read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse shadow-lg shadow-cyan-500/50"></div>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-1 mt-1">{notif.description}</p>
                  <p className="text-xs text-slate-500 mt-2 font-semibold">
                    📅 {new Date(notif.created_at).toLocaleDateString('sr-RS')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {notifications.length > 5 && (
        <button className="w-full py-3 text-center text-sm font-bold text-purple-300 hover:text-cyan-300 transition-all rounded-lg hover:bg-purple-500/20 border border-purple-500/30 hover:border-cyan-500/50 uppercase tracking-wider">
          👁️ Pogledaj sve notifikacije ({notifications.length})
        </button>
      )}
    </div>
  )
}
