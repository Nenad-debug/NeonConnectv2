export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">Za kandidate</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Pronađi posao</a></li>
              <li><a href="#" className="hover:text-white">Moj profil</a></li>
              <li><a href="#" className="hover:text-white">Apliciranih</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Za poslodavce</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Objavi posao</a></li>
              <li><a href="#" className="hover:text-white">Pregledaj aplikacije</a></li>
              <li><a href="#" className="hover:text-white">Upravljaj poslovima</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">O nama</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Kontakt</a></li>
              <li><a href="#" className="hover:text-white">Uslovi korišćenja</a></li>
              <li><a href="#" className="hover:text-white">Privatnost</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 NeonConnect. Sva prava zadržana.</p>
        </div>
      </div>
    </footer>
  )
}
