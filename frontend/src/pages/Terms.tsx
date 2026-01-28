import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Background from '../components/common/Background'

export default function Terms() {
  return (
    <div className="min-h-screen gradient-bg text-white relative overflow-hidden py-20">
      <Background />

      <div className="relative max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="space-y-4 mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Nazad na početnu
          </Link>
          <h1 className="text-5xl font-black text-white">Uslovi korišćenja</h1>
          <p className="text-slate-300 text-lg">Zadnja ažuriranja: 28. januar 2026.</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">1. Prihvatanje uslova</h2>
            <p className="text-slate-300 leading-relaxed">
              Korišćenjem NeonConnect platforme, prihvatate ove uslove korišćenja. Ako se ne slažete sa bilo kojim delom ovih uslova, molimo vas da prestanete sa korišćenjem platforme. NeonConnect zadržava pravo da izmeni ove uslove bilo kada, a korisnici će biti obavešteni o značajnim promenama.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">2. Registracija i nalog</h2>
            <p className="text-slate-300 leading-relaxed">
              Da biste koristili NeonConnect, morate da se registrujete sa tačnim i kompletnim informacijama. Vi ste odgovorni za čuvanje bezbednosti vašeg naloga i lozinke. Svaka aktivnost na vašem nalogu je vaša odgovornost. Zabranjeno je kreirajnje više naloga ili korišćenje tuđeg naloga.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">3. Zabrane</h2>
            <p className="text-slate-300 leading-relaxed mb-3">Zabranjeno je:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Objavljivanje nepravilnog, uvredljivog ili zabranjenog sadržaja</li>
              <li>Spam, muljažu ili manipulaciju</li>
              <li>Neovlašćeni pristup ili preuzimanje podataka</li>
              <li>Prodaja ili razmena naloga</li>
              <li>Korišćenje za ilegalne aktivnosti</li>
              <li>Automatizovano prikupljanje podataka bez dozvole</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">4. Intelektualna svojina</h2>
            <p className="text-slate-300 leading-relaxed">
              Sav sadržaj na NeonConnect (tekst, grafika, logo, dizajn) je zaštićen autorskim pravima. Zabranjena je reprodukcija, distribucija ili korišćenje bez dozvole. Korisnici zadržavaju prava na svoj sadržaj koji objavljuju, ali daju NeonConnect dozvolu za korišćenje u cilju poboljšanja usluge.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">5. Odgovornost</h2>
            <p className="text-slate-300 leading-relaxed">
              NeonConnect je dostupan "kako jeste" bez garancije. Nismo odgovorni za štete nastale korišćenjem platforme. Posebno, nismo odgovorni za: gubitak podataka, prekid rada, finansijsku štetu ili indirektne štete. Maksimalna odgovornost je ograničena na iznos koji ste platili.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">6. Odsecanje naloga</h2>
            <p className="text-slate-300 leading-relaxed">
              NeonConnect može otkazati ili suspendovati nalog bez upozorenja ako je utvrđeno da ste prekršili ove uslove ili da vršite nezakonite aktivnosti. Nakon odsecanja, ostaje vam pristup skladištenju svojih podataka u skadu sa nalaskim zakonima.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">7. Primenjivo pravo</h2>
            <p className="text-slate-300 leading-relaxed">
              Ovi uslovi se reguliše zakonima Republike Srbije. Svi sporovi biće razrešeni pred nadležnim sudovima u Srbiji.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">8. Kontakt</h2>
            <p className="text-slate-300 leading-relaxed">
              Ako imate pitanja o ovim uslovima, kontaktirajte nas na: <span className="text-blue-400">support@neonconnect.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
