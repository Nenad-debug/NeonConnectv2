import { useState } from 'react'
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import ImageUpload from './ImageUpload'

interface ProfileSetupProps {
  onComplete: (profileData: any) => Promise<void>
  isOpen: boolean
  user?: any
}

interface ProfileFormData {
  firstName: string
  lastName: string
  bio: string
  phone: string
  location: string
  experienceYears: number
  skills: string[]
  skillInput: string
  education: string[]
  educationInput: string
  certifications: string[]
  certificationInput: string
  languages: string[]
  languageInput: string
  website: string
  githubUrl: string
  linkedinUrl: string
  profileImage: File | null
  profileImagePreview: string | null
}

const STEPS = [
  { id: 1, label: 'Osnovne info', icon: '👤' },
  { id: 2, label: 'Kontakt', icon: '📞' },
  { id: 3, label: 'Iskustvo', icon: '💼' },
  { id: 4, label: 'Veštine & Jezici', icon: '🎯' },
  { id: 5, label: 'Edukacija', icon: '🎓' },
  { id: 6, label: 'Linkovi & Slika', icon: '🔗' },
]

export default function ProfileSetup({ onComplete, isOpen, user }: ProfileSetupProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.user_metadata?.full_name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    bio: '',
    phone: '',
    location: '',
    experienceYears: 0,
    skills: [],
    skillInput: '',
    education: [],
    educationInput: '',
    certifications: [],
    certificationInput: '',
    languages: [],
    languageInput: '',
    website: '',
    githubUrl: '',
    linkedinUrl: '',
    profileImage: null,
    profileImagePreview: null,
  })

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experienceYears' ? parseInt(value) || 0 : value
    }))
  }

  const addArrayItem = (field: 'skills' | 'education' | 'certifications' | 'languages') => {
    const inputField = `${field.slice(0, -1)}Input` as keyof ProfileFormData
    const inputValue = formData[inputField] as string
    
    if (inputValue.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), inputValue],
        [inputField]: ''
      }))
    }
  }

  const removeArrayItem = (field: 'skills' | 'education' | 'certifications' | 'languages', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const handleImageSelected = (file: File, preview: string) => {
    setFormData(prev => ({
      ...prev,
      profileImage: file,
      profileImagePreview: preview
    }))
  }

  const validateStep = (): boolean => {
    setError(null)
    
    switch (currentStep) {
      case 1:
        if (!formData.firstName.trim()) {
          setError('Ime je obavezno')
          return false
        }
        if (!formData.lastName.trim()) {
          setError('Prezime je obavezno')
          return false
        }
        if (!formData.bio.trim()) {
          setError('Bio je obavezan')
          return false
        }
        return true
      
      case 2:
        if (!formData.phone.trim()) {
          setError('Telefon je obavezan')
          return false
        }
        if (!formData.location.trim()) {
          setError('Lokacija je obavezna')
          return false
        }
        return true
      
      case 6:
        if (!formData.profileImage) {
          setError('Profilna slika je obavezna')
          return false
        }
        return true
      
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setLoading(true)
    setError(null)

    try {
      await onComplete({
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        experienceYears: formData.experienceYears,
        skills: formData.skills,
        education: formData.education,
        certifications: formData.certifications,
        languages: formData.languages,
        website: formData.website,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl,
        profileImage: formData.profileImage,
      })
    } catch (err: any) {
      setError(err.message || 'Greška pri čuvanju profila')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-100"></div>
          
          <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-3xl font-black text-white">Kreiraj svoj profil</h1>
              <p className="text-slate-300">
                Dopuni sve informacije da bi domaćini videli ko si i šta tražiš
              </p>
            </div>

            {/* Progress indicator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                {STEPS.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => idx < currentStep && setCurrentStep(step.id)}
                      className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-all ${
                        step.id <= currentStep
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {step.id < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                    </button>
                    
                    {idx < STEPS.length - 1 && (
                      <div className={`flex-1 h-1 rounded-full transition-all ${
                        step.id < currentStep
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                          : 'bg-slate-800'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-slate-400 text-center">
                Korak {currentStep} od {STEPS.length}: {STEPS[currentStep - 1].label}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Form content */}
            <div className="space-y-6 min-h-96">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Ime <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Tvoje ime"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Prezime <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Tvoje prezime"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Kratka biografija <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Napiši nešto o sebi, šta tražiš, tvoje ambicije..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-2">Preporuka: 100-200 karaktera</p>
                  </div>
                </div>
              )}

              {/* Step 2: Contact */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Telefon <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+381 60 123 4567"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Lokacija <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Beograd, Srbija"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Experience */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Godina iskustva
                    </label>
                    <select
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white focus:border-blue-500 focus:outline-none transition-all"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(year => (
                        <option key={year} value={year}>
                          {year === 0 ? 'Početnik' : `${year}+ godina`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 4: Skills & Languages */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Veštine
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        name="skillInput"
                        value={formData.skillInput}
                        onChange={handleInputChange}
                        placeholder="React, TypeScript, Node.js..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addArrayItem('skills')
                          }
                        }}
                        className="flex-1 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                      />
                      <button
                        onClick={() => addArrayItem('skills')}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
                      >
                        Dodaj
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/50 text-sm flex items-center gap-2"
                        >
                          {skill}
                          <button
                            onClick={() => removeArrayItem('skills', idx)}
                            className="text-blue-300 hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Jezici
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        name="languageInput"
                        value={formData.languageInput}
                        onChange={handleInputChange}
                        placeholder="Srpski, Engleski, Nemački..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addArrayItem('languages')
                          }
                        }}
                        className="flex-1 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                      />
                      <button
                        onClick={() => addArrayItem('languages')}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all"
                      >
                        Dodaj
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((lang, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-sm flex items-center gap-2"
                        >
                          {lang}
                          <button
                            onClick={() => removeArrayItem('languages', idx)}
                            className="text-emerald-300 hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Education */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Obrazovanje
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        name="educationInput"
                        value={formData.educationInput}
                        onChange={handleInputChange}
                        placeholder="Računarski fakultet - Beograd"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addArrayItem('education')
                          }
                        }}
                        className="flex-1 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                      />
                      <button
                        onClick={() => addArrayItem('education')}
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all"
                      >
                        Dodaj
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.education.map((edu, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-800/50 border border-purple-500/50 flex items-center justify-between"
                        >
                          <p className="text-white text-sm">{edu}</p>
                          <button
                            onClick={() => removeArrayItem('education', idx)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Sertifikati
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        name="certificationInput"
                        value={formData.certificationInput}
                        onChange={handleInputChange}
                        placeholder="AWS Solutions Architect"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addArrayItem('certifications')
                          }
                        }}
                        className="flex-1 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                      />
                      <button
                        onClick={() => addArrayItem('certifications')}
                        className="px-4 py-2 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition-all"
                      >
                        Dodaj
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.certifications.map((cert, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-800/50 border border-yellow-500/50 flex items-center justify-between"
                        >
                          <p className="text-white text-sm">{cert}</p>
                          <button
                            onClick={() => removeArrayItem('certifications', idx)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Links & Image */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Lični veb sajt (opciono)
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://tvoj-sajt.com"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      GitHub profil (opciono)
                    </label>
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleInputChange}
                      placeholder="https://github.com/korisnicko-ime"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      LinkedIn profil (opciono)
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <ImageUpload 
                    onImageSelected={handleImageSelected}
                    currentImage={formData.profileImagePreview || undefined}
                  />
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-700/50">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6 py-3 rounded-lg border border-slate-700/50 text-white hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold"
              >
                <ChevronLeft className="w-5 h-5" />
                Nazad
              </button>

              {currentStep === STEPS.length ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {loading ? 'Čuvam...' : 'Završi'}
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2"
                >
                  Dalje
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
