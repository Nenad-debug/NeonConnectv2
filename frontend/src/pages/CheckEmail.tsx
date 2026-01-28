import { useLocation, Link } from 'react-router-dom'

export default function CheckEmail() {
  const loc = useLocation()
  const params = new URLSearchParams(loc.search)
  const email = params.get('email') || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Proveri svoj email</h2>
          <p className="text-gray-400 mb-6">Poslali smo ti link za potvrdu naloga.</p>

          {email && (
            <p className="mb-4 text-sm text-gray-300">Poslato na: <strong>{email}</strong></p>
          )}

          <p className="text-gray-400 mb-6">Ako ti ne stigne, proveri spam folder ili klikni na dugme ispod da se vratiš na stranicu za prijavu.</p>

          <Link to="/login" className="inline-block bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
            Prijavi se
          </Link>
        </div>
      </div>
    </div>
  )
}
