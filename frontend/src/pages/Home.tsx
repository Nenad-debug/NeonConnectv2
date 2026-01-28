import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Users, Zap, Shield, ArrowRight, Mail, X, HelpCircle } from 'lucide-react'
import Background from '../components/common/Background'
import StatsSection from '../components/common/StatsSection'
import SocialProof from '../components/common/SocialProof'

export default function Home() {
  const [showContactModal, setShowContactModal] = useState(false)
  const [showTestingGuide, setShowTestingGuide] = useState(false)
  const [contactForm, setContactForm] = useState({ email: '', subject: '', message: '' })
  const [contactLoading, setContactLoading] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactLoading(true)
    
    // Simulate email sending - u budućnosti može biti Supabase Edge Function ili external API
    setTimeout(() => {
      setContactLoading(false)
      setShowContactModal(false)
      setContactForm({ email: '', subject: '', message: '' })
      alert('Hvala na poruci! Odgovorićemo vam uskoro.')
    }, 1500)
  }

  return (
    <div className="min-h-screen gradient-bg text-white relative overflow-hidden">
      <Background />

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-8 z-10">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full text-sm font-semibold text-blue-300 animate-fade-in">
                ✨ Novi način pronalaženja posla
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Pronađi <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">posao</span> koji transformiše tvoju karijeru
              </h1>
            </div>

            <p className="text-lg md:text-xl text-slate-300 max-w-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Poveži se sa najboljim kompanijama. NeonConnect je platforma za one koji žele da rastu i uče.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link 
                to="/jobs" 
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-bold text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Pretraži poslove
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/signup?role=employer" 
                className="px-8 py-4 border-2 border-slate-500 rounded-lg font-bold text-white hover:bg-slate-800/50 hover:border-blue-500 transition-all duration-300"
              >
                Objavi posao
              </Link>
              <button
                onClick={() => setShowTestingGuide(true)}
                className="px-8 py-4 border-2 border-emerald-500/50 hover:border-emerald-400 rounded-lg font-bold text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-5 h-5" />
                Vodič
              </button>
            </div>

            {/* Social proof */}
            <SocialProof />
          </div>

          {/* Right: Featured Jobs Card */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/40 p-8 rounded-2xl shadow-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Istaknuti oglasi</h3>
                  <span className="text-xs bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full">Sveže</span>
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Frontend Developer', location: 'Remote · Senior', salary: '€60k-80k', icon: '🎨' },
                    { title: 'Backend Developer', location: 'Belgrade · Mid', salary: '€50k-70k', icon: '⚙️' },
                    { title: 'UI/UX Designer', location: 'Remote · Senior', salary: '€45k-65k', icon: '✨' },
                  ].map((job, idx) => (
                    <div 
                      key={idx}
                      className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/50 hover:bg-slate-700/60 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group/job"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-3 flex-1">
                          <span className="text-2xl">{job.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-white group-hover/job:text-blue-300 transition-colors">{job.title}</h4>
                            <p className="text-sm text-slate-400">{job.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-300">{job.salary}</p>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover/job:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/jobs" className="mt-6 w-full py-2 text-center text-sm font-semibold text-blue-400 hover:text-blue-300 border-t border-slate-700/50 pt-4">
                  Pogledaj sve poslove →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Zašto odabrati <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">NeonConnect</span>?
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Dizajnirano sa stilom i brzo. Lako za korisnike i moćno za kompanije.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Briefcase, title: 'Velika baza poslova', desc: 'Stotine aktivnih oglasa iz različitih industrija' },
              { icon: Users, title: 'Provereni poslodavci', desc: 'Samo ozbiljne kompanije sa potvrđenim profilima' },
              { icon: Zap, title: 'Brz proces', desc: 'Registracija u minutama, pogledaj poslove odmah' },
              { icon: Shield, title: 'Sigurnost podataka', desc: 'Tvoji podaci su zaštićeni sa najvećim standardima' },
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="group p-6 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-blue-500/60 hover:bg-slate-800/60 transition-all duration-300 transform hover:-translate-y-2"
              >
                <feature.icon className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Kako funkcioniše?</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Svega 3 koraka do tvoga sledećeg posla
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, icon: '📝', title: 'Kreiraj profil', desc: 'Registruj se i popuni tvoj profil za samo par minuta' },
              { step: 2, icon: '🔍', title: 'Pretraži poslove', desc: 'Pronađi idealne pozicije koje se poklapaju sa tvojim veštinama' },
              { step: 3, icon: '🎉', title: 'Dobij ponudu', desc: 'Pošalji prijavu i čekaj odgovor od poslodavca' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 p-8 rounded-xl border border-slate-700/60 hover:border-blue-500/60 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold mb-4 mx-auto">
                    {item.step}
                  </div>
                  <p className="text-center text-4xl mb-4">{item.icon}</p>
                  <h3 className="text-xl font-bold text-center mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-center text-sm">{item.desc}</p>
                </div>
                
                {/* Arrow between steps */}
                {idx < 2 && (
                  <div className="hidden md:flex absolute -right-4 top-1/3 items-center justify-center">
                    <ArrowRight className="w-8 h-8 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <StatsSection />

      {/* ===== CONTACT SECTION ===== */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Gradient border background */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Content card */}
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 md:p-12 space-y-6">
              <div className="flex items-center gap-4">
                <Mail className="w-10 h-10 text-blue-400" />
                <h2 className="text-3xl md:text-4xl font-bold">Kontaktiraj nas</h2>
              </div>
              
              <p className="text-lg text-slate-300">
                Imaš pitanja ili povratne informacije? Slobodno nam piši! Odgovor ćeš dobiti u roku od 24 sata.
              </p>

              <button 
                onClick={() => setShowContactModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Pošalji poruku
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Pošalji nam poruku</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleContactSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Email *</label>
                <input 
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="tvoj@email.com"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Tema *</label>
                <input 
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="Šta te zanima?"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Poruka *</label>
                <textarea 
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Napiši svoju poruku ovde..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-700/50 rounded-lg font-semibold text-white hover:bg-slate-800/50 transition-colors"
                >
                  Otkaži
                </button>
                <button 
                  type="submit"
                  disabled={contactLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {contactLoading ? 'Slanje...' : 'Pošalji'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Spreman za sledeći korak?
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Počni pretragu sada i pronađi posao koji te čeka
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Kreiraj besplatan profil
            </Link>
            <Link 
              to="/jobs" 
              className="px-8 py-4 border-2 border-slate-500 rounded-lg font-bold text-white hover:bg-slate-800/50 transition-all duration-300"
            >
              Pogledaj poslove
            </Link>
          </div>
        </div>
      </section>

      {/* Testing Guide Modal */}
      {showTestingGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 w-full max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold flex items-center gap-2">
                <HelpCircle className="w-8 h-8 text-emerald-400" />
                Vodič za Testiranje
              </h3>
              <button 
                onClick={() => setShowTestingGuide(false)}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-slate-300">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-emerald-300 mb-2">👋 Dobrodošla, Draga!</p>
                <p className="text-sm">Ovo je detaljni vodič za testiranje NeonConnect sajta. Sledi 10 koraka i proveravaj sve funkcionalnosti.</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-lg">📋 10 Koraka za Testiranje:</h4>
                <ol className="space-y-2 text-sm">
                  <li><span className="font-semibold text-blue-300">1.</span> Otvorite sajtи proverite glavni ekran</li>
                  <li><span className="font-semibold text-blue-300">2.</span> Registrujte se kao KANDIDAT sa SVOJOM email adresom</li>
                  <li><span className="font-semibold text-blue-300">3.</span> Proverite email potvrdu (trebalo bi da stigne kod)</li>
                  <li><span className="font-semibold text-blue-300">4.</span> Prijavite se sa tom email adresom</li>
                  <li><span className="font-semibold text-blue-300">5.</span> Odjavite se i vratite se (trebalo bi Account Switcher)</li>
                  <li><span className="font-semibold text-blue-300">6.</span> Registrujte se kao POSLODAVAC sa DRUGOM email adresom</li>
                  <li><span className="font-semibold text-blue-300">7.</span> Objavite novi posao</li>
                  <li><span className="font-semibold text-blue-300">8.</span> Proverite da li se posao vidi na Jobs stranici</li>
                  <li><span className="font-semibold text-blue-300">9.</span> Proverite statistiku (trebalo bi 2 korisnika, 1 posao)</li>
                  <li><span className="font-semibold text-blue-300">10.</span> Testirajте na mobilnom telefonu</li>
                </ol>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm">
                <p className="font-semibold text-blue-300 mb-2">🔑 Koristi Svoju Email Adresu:</p>
                <p className="text-xs text-slate-300 mb-2">Koristi tvoju PRAVU email adresu kako bi mogla da primi kod za potvrdu!</p>
                <p className="font-mono text-xs bg-slate-800/50 p-2 rounded mb-2">Tvoja email adresa (pravi email)</p>
                <p className="text-xs mt-2">Lozinka: <span className="font-mono">TestPassword123!</span> ili što god želiš</p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm">
                <p className="font-semibold text-yellow-300 mb-2">⚠️ Važne Napomene:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Brojevi na početnoj stranici mogu biti 0 (NORMALNO je)</li>
                  <li>• Email potvrde stižu u Spam folder - PROVERITE!</li>
                  <li>• Account Switcher se pojavljuje nakon logout-a</li>
                  <li>• Ako nešto ne radi, osvežite stranicu (F5) i obavezno obrišite cookies</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={() => setShowTestingGuide(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
              >
                Razumem - Kreni sa Testiranjem
              </button>
              <button
                onClick={() => setShowTestingGuide(false)}
                className="flex-1 px-6 py-3 border-2 border-slate-600 rounded-lg font-semibold text-slate-300 hover:bg-slate-800/50 transition-all duration-300"
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
