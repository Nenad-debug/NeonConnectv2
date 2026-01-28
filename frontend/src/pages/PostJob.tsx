import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobService } from '../services/jobService'

export default function PostJob() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [locationCountry, setLocationCountry] = useState('')
  const [salaryMin, setSalaryMin] = useState<number | ''>('')
  const [salaryMax, setSalaryMax] = useState<number | ''>('')
  const [salaryCurrency, setSalaryCurrency] = useState('EUR')
  const [jobType, setJobType] = useState<'full-time' | 'part-time' | 'contract' | 'freelance'>('full-time')
  const [remote, setRemote] = useState(false)
  const [skills, setSkills] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title || !description) {
      setError('Title and description are required')
      return
    }

    setLoading(true)
    try {
      const job = await jobService.createJob({
        employer_id: '00000000-0000-0000-0000-000000000000', // TODO: replace with actual employer id from auth
        title,
        description,
        category: jobType,
        location: { city: locationCity, country: locationCountry },
        salary_min: typeof salaryMin === 'number' ? salaryMin : undefined,
        salary_max: typeof salaryMax === 'number' ? salaryMax : undefined,
        salary_currency: salaryCurrency,
        job_type: jobType,
        remote,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        required_skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        status: 'active',
      })

      navigate(`/jobs/${job.id}`)
    } catch (err: any) {
      setError(err.message || 'Greška pri kreiranju posla')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold mb-6">Objavi novi posao</h2>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Naziv pozicije</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 rounded-md bg-slate-700 text-white" />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Opis</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full p-3 rounded-md bg-slate-700 text-white" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Grad</label>
            <input value={locationCity} onChange={e => setLocationCity(e.target.value)} className="w-full p-3 rounded-md bg-slate-700 text-white" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Država</label>
            <input value={locationCountry} onChange={e => setLocationCountry(e.target.value)} className="w-full p-3 rounded-md bg-slate-700 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Plata min</label>
            <input value={salaryMin} onChange={e => setSalaryMin(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 rounded-md bg-slate-700 text-white" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Plata max</label>
            <input value={salaryMax} onChange={e => setSalaryMax(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 rounded-md bg-slate-700 text-white" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Valuta</label>
            <input value={salaryCurrency} onChange={e => setSalaryCurrency(e.target.value)} className="w-full p-3 rounded-md bg-slate-700 text-white" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} /> Remote</label>
          <label className="block text-sm text-slate-300">Vrsta posla</label>
          <select value={jobType} onChange={e => setJobType(e.target.value as any)} className="p-3 rounded-md bg-slate-700 text-white">
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Veštine (odvojene zarezom)</label>
          <input value={skills} onChange={e => setSkills(e.target.value)} className="w-full p-3 rounded-md bg-slate-700 text-white" />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 rounded-md">{loading ? 'Objavljivanje...' : 'Objavi'}</button>
        </div>
      </form>
    </div>
  )
}
