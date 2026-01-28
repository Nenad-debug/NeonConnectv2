import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Background from '../components/common/Background'

export default function Privacy() {
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
          <h1 className="text-5xl font-black text-white">Politika privatnosti</h1>
          <p className="text-slate-300 text-lg">Zadnja ažuriranja: 28. januar 2026.</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">1. Uvod</h2>
            <p className="text-slate-300 leading-relaxed">
              Zaštita vaših podataka je naš najveći prioritet. Ova politika privatnosti objašnjava kako NeonConnect prikuplja, koristi, čuva i štiti vaše podatke. Ova politika se primenjuje na sve korisnike naše platforme.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">2. Prikupljanje podataka</h2>
            <p className="text-slate-300 leading-relaxed mb-3">Prikupljamo sledeće tipove podataka:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li><strong>Lični podaci:</strong> Ime, prezime, email, broj telefona</li>
              <li><strong>Profesionalni podaci:</strong> Iskustvo, veštine, certifikati, portfolio</li>
              <li><strong>Podaci o poslodavcu:</strong> Naziv firme, industrija, veličina</li>
              <li><strong>Tehnički podaci:</strong> IP adresa, tip pregledača, vreme pristupa</li>
              <li><strong>Podaci o komunikaciji:</strong> Poruke, povratne informacije, komentari</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">3. Korišćenje podataka</h2>
            <p className="text-slate-300 leading-relaxed mb-3">Vaše podatke koristimo za:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Kreiranje i upravljanje vašim nalogom</li>
              <li>Prikazivanje relevantnih poslova ili kandidata</li>
              <li>Slanje komunikacija i obaveštenja</li>
              <li>Poboljšavanje algoritma za pronalaženje posla/kandidata</li>
              <li>Analize i statistika platforme</li>
              <li>Sprečavanje zloupotrebе i borba protiv prevara</li>
              <li>Poštovanje zakona i propisa</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">4. Delenje podataka</h2>
            <p className="text-slate-300 leading-relaxed">
              Vaše podatke ne delimo sa trećim stranama osim u sledećim slučajevima: sa vlasničkim uslugama koje vam pomažu da bolje koristite platformu (plaćanja, analitika), u slučaju spajanja ili preuzimanja kompanije, ako je to zahtevano zakonom ili sudskom naredbom, i sa vašom izričitom dozvolom.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">5. Bezbednost podataka</h2>
            <p className="text-slate-300 leading-relaxed">
              Koristimo industrijske standarde za zaštitu vaših podataka, uključujući: šifrovanje (SSL/TLS), bezbedne servere, redovne bezbednosne provere i ograničen pristup zaposlenih. Međutim, nijedna metoda prenosa preko interneta nije 100% bezbedna, pa ne možemo garantovati apsolutnu zaštitu.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">6. Čuvanje podataka</h2>
            <p className="text-slate-300 leading-relaxed">
              Čuvamo vaše podatke dok je vaš nalog aktivan. Nakon brisanja naloga, aktivni podaci se brišu u roku od 30 dana, osim ako je zakonom zahtevano duže čuvanje. Arhivirani ili anonimizovani podaci se mogu čuvati duže u statističke svrhe.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">7. Vaša prava</h2>
            <p className="text-slate-300 leading-relaxed mb-3">Imate sledeća prava:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li><strong>Pravo na pristup:</strong> Možete tražiti kopiju svojih podataka</li>
              <li><strong>Pravo na ispravku:</strong> Možete ažurirati nepravilne podatke</li>
              <li><strong>Pravo na brisanje:</strong> Možete tražiti brisanje svojih podataka ("pravo na zaboravljanje")</li>
              <li><strong>Pravo na prenosivost:</strong> Možete preuzeti svoje podatke u formatu koji vam odgovara</li>
              <li><strong>Pravo da se usuprotstavite:</strong> Možete se usuprotstaviti automatizovanoj obradi</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">8. Kolačići</h2>
            <p className="text-slate-300 leading-relaxed">
              Koristimo kolačiće za poboljšanje korisničkog iskustva. Kolačići su mali tekstualni fajlovi koji se čuvaju na vašem uređaju. Možete da onemogućite kolačiće u postavkama pregledača, ali to može uticati na funkcionalnost platforme.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">9. Analitika</h2>
            <p className="text-slate-300 leading-relaxed">
              Koristimo Google Analytics i druge alate za analizu kako korisnici koriste platformu. Ovi alati mogu prikupljati podatke kao što su vreme provedeno na sajtu, stranice koje ste posjetili i broj klikova. Svi ovi podaci su anonimizovani.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">10. GDPR usaglašenost</h2>
            <p className="text-slate-300 leading-relaxed">
              NeonConnect je usklađena sa Generalnom uredbom o zaštiti podataka (GDPR) EU. Ako ste iz EU, imate dodatna prava kao što je pravo na premeštanje podataka i pravo na prigovor.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">11. Deca</h2>
            <p className="text-slate-300 leading-relaxed">
              NeonConnect nije namenjena deci ispod 18 godina. Ne prikupljamo svesno podatke od dece. Ako saznamo da smo prikupili podatke od deteta, odmah ćemo je obrisati i obavijestiti roditelje.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-blue-300">12. Kontakt</h2>
            <p className="text-slate-300 leading-relaxed">
              Za pitanja o privatnosti ili ako želite da izvrante svoja prava, kontaktirajte nas na: <span className="text-blue-400">privacy@neonconnect.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
