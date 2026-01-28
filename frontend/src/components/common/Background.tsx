export default function Background() {
  return (
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
  )
} 
