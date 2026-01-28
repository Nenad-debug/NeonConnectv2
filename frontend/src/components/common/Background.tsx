import { Briefcase, Users, TrendingUp, Zap, Target, Award, Rocket, Star, Code, Lightbulb, MessageSquare, Smartphone, Package, Headphones, GitBranch, Palette } from 'lucide-react'

export default function Background() {
  // Floating icons data
  const floatingIcons = [
    { Icon: Briefcase, x: 10, y: 20, duration: 8, delay: 0 },
    { Icon: Users, x: 85, y: 15, duration: 10, delay: 1 },
    { Icon: TrendingUp, x: 80, y: 70, duration: 12, delay: 2 },
    { Icon: Zap, x: 15, y: 75, duration: 9, delay: 0.5 },
    { Icon: Target, x: 50, y: 85, duration: 11, delay: 1.5 },
    { Icon: Award, x: 70, y: 35, duration: 13, delay: 2.5 },
    { Icon: Rocket, x: 20, y: 50, duration: 10, delay: 1 },
    { Icon: Star, x: 60, y: 15, duration: 12, delay: 0.7 },
    { Icon: Code, x: 75, y: 50, duration: 11, delay: 1.2 },
    { Icon: Lightbulb, x: 25, y: 35, duration: 9, delay: 0.3 },
    { Icon: MessageSquare, x: 65, y: 60, duration: 10, delay: 2 },
    { Icon: Smartphone, x: 40, y: 25, duration: 12, delay: 1.8 },
    { Icon: Package, x: 55, y: 45, duration: 11, delay: 0.9 },
    { Icon: Headphones, x: 30, y: 65, duration: 13, delay: 2.2 },
    { Icon: GitBranch, x: 70, y: 80, duration: 10, delay: 1.4 },
    { Icon: Palette, x: 45, y: 70, duration: 12, delay: 0.6 },
  ]

  return (
    <>
      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(-5deg); }
        }
        
        @keyframes floatFast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(15deg); }
        }
        
        .animate-float-slow {
          animation: floatSlow infinite ease-in-out;
        }
        
        .animate-float-fast {
          animation: floatFast infinite ease-in-out;
        }
      `}</style>

      {/* Background gradient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-10 -top-20 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-600 via-purple-500 to-transparent opacity-40 filter blur-3xl animate-float" />
        <div className="absolute right-0 top-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-transparent opacity-30 filter blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute left-1/4 bottom-0 w-[520px] h-[320px] rounded-[40%] bg-gradient-to-br from-slate-700 via-indigo-700 to-transparent opacity-20 filter blur-2xl animate-float" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.45) 35%, rgba(255,255,255,0) 70%)',
          }}
        />
      </div>

      {/* Floating Icons Background */}
      <div className="pointer-events-none fixed inset-0 -z-5 overflow-hidden">
        {floatingIcons.map((item, idx) => {
          const Icon = item.Icon
          const animationName = idx % 3 === 0 ? 'floatSlow' : idx % 3 === 1 ? 'float' : 'floatFast'
          
          return (
            <div
              key={idx}
              className="absolute opacity-10 hover:opacity-20 transition-opacity duration-300"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                animation: `${animationName} ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <Icon className="w-16 h-16 md:w-20 md:h-20 text-blue-400" strokeWidth={1.5} />
            </div>
          )
        })}
      </div>
    </>
  )
} 
