import { useState, useRef } from 'react'
import { Upload, X, CheckCircle } from 'lucide-react'

interface ImageUploadProps {
  onImageSelected: (file: File, preview: string) => void
  currentImage?: string
  label?: string
  maxSizeMB?: number
}

export default function ImageUpload({ 
  onImageSelected, 
  currentImage,
  label = 'Profilna slika',
  maxSizeMB = 5 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setLoading(true)

    // Validacija tipa
    if (!file.type.startsWith('image/')) {
      setError('Molimo izaberite sliku (JPG, PNG, GIF)')
      setLoading(false)
      return
    }

    // Validacija veličine
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      setError(`Slika ne sme biti veća od ${maxSizeMB}MB`)
      setLoading(false)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string
      setPreview(previewUrl)
      onImageSelected(file, previewUrl)
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-white">
        {label}
        <span className="text-red-400 ml-1">*</span>
      </label>

      {/* Preview */}
      {preview && (
        <div className="relative w-full">
          <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-slate-800/50">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
            
            {/* Success badge */}
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/50">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">Učitano</span>
            </div>

            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="absolute bottom-3 right-3 p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload area */}
      {!preview && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer transition-all duration-300 ${
            isDragging 
              ? 'border-blue-400' 
              : 'border-slate-700/50'
          }`}
        >
          {/* Gradient border effect */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 rounded-xl blur opacity-0 ${
            isDragging ? 'opacity-100' : 'group-hover:opacity-100'
          } transition-opacity duration-300`}></div>

          {/* Content */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl border-2 border-dashed rounded-xl p-12 text-center space-y-4 transition-all duration-300">
            <div className="flex justify-center">
              <div className="p-4 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-all">
                <Upload className={`w-8 h-8 text-blue-300 ${loading ? 'animate-bounce' : ''}`} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">
                {isDragging ? 'Pusti sliku ovde' : 'Prevuci sliku ovde ili klikni'}
              </p>
              <p className="text-sm text-slate-400">
                Podržani formati: JPG, PNG, GIF (Max {maxSizeMB}MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Info text */}
      <p className="text-xs text-slate-500">
        Preporuka: Koristi profesionalnu fotografiju. Ovo će korisnici videti na tvom profilu.
      </p>
    </div>
  )
}
