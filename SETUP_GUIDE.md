# 🚀 NeonConnect - KOMPLETNA SETUP INSTRUKCIJA

## 📋 PREGLED

NeonConnect je sada **KOMPLETAN I DEPLOYOVAN** na Supabase. Evo kako da kreneš sa razvojem.

---

## 🔧 INSTALACIJA I SETUP

### 1. Kloniranje Repozitorijuma
```bash
cd c:\Users\malet\OneDrive\Desktop\NeonConnect
```

### 2. Environment Variables Setup

#### Frontend (.env)
```bash
# frontend/.env
VITE_SUPABASE_URL=https://vkxkzgjdluusviccnsdw.supabase.co
VITE_SUPABASE_ANON_KEY=<dobiti-iz-Supabase-Dashboard>
VITE_API_URL=http://localhost:5173
```

#### Dobijanje API Keys iz Supabase:
1. Idi na https://supabase.com/dashboard/project/vkxkzgjdluusviccnsdw
2. Settings → API Settings
3. Kopiraj:
   - **Project URL** → VITE_SUPABASE_URL
   - **anon public key** → VITE_SUPABASE_ANON_KEY

### 3. Instalacija Dependencies

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend Functions (već deployovano na Supabase)
```bash
cd supabase/functions/ai-chat
# Funkcija je automatski deployujem, alt. redeploy:
npx supabase functions deploy ai-chat
```

---

## ✅ PROVERA STATUS-A

### Build Frontend-a
```bash
cd frontend
npm run build
```
**Očekivani rezultat**: ✅ 1433 modules transformed, 0 errors

### Check Supabase Tabela
```bash
npx supabase db list
```

### Check Deployed Functions
```bash
npx supabase functions list
```

---

## 🎯 TESTIRANJE FUNKCIONALNOSTI

### 1. Login/Signup
1. Otvori http://localhost:5173
2. Klikni "Sign Up"
3. Unesi email i lozinku
4. Proverite Supabase Auth → Users

### 2. Profile Setup (AI Wizard)
1. Nakon login-a, trebala bi da se pojavi Profile Setup wizard
2. Odgovori na AI pitanja
3. Profil se automatski čuva u `public.candidate_profiles`

### 3. AI Chat
1. Klikni na "AI Assistant" ikonu (dole desno)
2. Unesi pitanje
3. Supabase edge function odgovara sa GPT-3.5

### 4. Job Search
1. Idi na "Jobs" stranicu
2. Pretraži poslove (filtri su dostupni)
3. Sačuvaj job sa ❤️ ikonom
4. Proverite `saved_jobs` tabelu

---

## 📊 DATABASE STRUKTURA

### Glavne Tabele

#### users
```sql
SELECT * FROM users LIMIT 5;
```
- Email-based authentication sa Supabase Auth
- Fields: id, email, created_at, updated_at

#### candidate_profiles
```sql
SELECT * FROM candidate_profiles LIMIT 5;
```
- Profil za kandidate (Job Seekers)
- Fields: first_name, last_name, bio, skills, location, education, experience

#### employer_profiles
```sql
SELECT * FROM employer_profiles LIMIT 5;
```
- Profil za poslodavce
- Fields: company_name, description, website, industry, size

#### jobs
```sql
SELECT * FROM jobs LIMIT 5;
```
- Otvorene pozicije
- Fields: title, description, salary, location, status (active/draft), employer_id

#### applications
```sql
SELECT * FROM applications LIMIT 5;
```
- Prijave kandidata na poslove
- Fields: candidate_id, job_id, status (pending/accepted/rejected)

#### chat_messages
```sql
SELECT * FROM chat_messages LIMIT 5;
```
- AI chat istorija
- Fields: user_id, message, response, context, created_at

#### saved_jobs
```sql
SELECT * FROM saved_jobs WHERE user_id = auth.uid();
```
- Sačuvani poslovi
- Fields: user_id, job_id, saved_at

---

## 🔐 ROW LEVEL SECURITY (RLS)

Sve tabele su zaštićene sa RLS politikama:

### Principle: Users vide samo svoje podatke
```sql
-- Primer: users vide samo svoje candidate_profiles
SELECT * FROM candidate_profiles 
WHERE user_id = auth.uid();

-- Employers vide samo svoje jobs
SELECT * FROM jobs 
WHERE employer_id = auth.uid();
```

### Enable RLS na novim tabelama
```sql
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
```

---

## 🤖 AI ASSISTANT (EDGE FUNCTION)

### Location
```
supabase/functions/ai-chat/index.ts
```

### API Endpoint
```
https://vkxkzgjdluusviccnsdw.supabase.co/functions/v1/ai-chat
```

### Usage Example
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/ai-chat`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: "Kako se koristi NeonConnect?",
      context: "general",  // profile_setup, job_search, employer, general
      previousMessages: []  // Chat history
    })
  }
)

const data = await response.json()
console.log(data.response) // AI odgovor
```

### Contexts
- `profile_setup`: Pomoć pri popunjavanju profila
- `job_search`: Pomoć pri pretrage poslova
- `employer`: Pomoć poslodavcima
- `general`: Opšta pomoć

---

## 📦 PRODUCTION DEPLOYMENT

### Frontend na Netlify
```bash
# Već ste konfigurirali netlify.toml
npm install -D netlify-cli
netlify deploy --prod
```

### Environment Variables na Netlify
1. Idi na Netlify → Site Settings → Build & Deploy
2. Build environment variables
3. Dodaj:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

---

## 🐛 DEBUGGING

### Logs
```bash
# Supabase functions logs
npx supabase functions logs ai-chat

# Frontend (u console-u)
Open DevTools (F12) → Console tab
```

### Supabase Studio
```
https://supabase.com/dashboard/project/vkxkzgjdluusviccnsdw
```

### Check RLS Issues
```sql
-- Test da li RLS pokreće probleme
SELECT * FROM jobs; -- Trebalo bi da vrati samo active jobs

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'jobs';
```

---

## 🚨 ČESTI PROBLEMI

### "Supabase nije dostupan"
- Proverite VITE_SUPABASE_URL
- Proverite internet konekciju
- Supabase status: https://status.supabase.com

### "RLS policy je odbio pristup"
- Proverite User ID je ispravan
- Proverite RLS politika je ispravna
- Koristite Supabase Studio da debuguješ

### "AI funkcija ne odgovara"
- Proverite AIML_API_KEY je postavljen na Supabase
- Proverite internet limit-e
- Proverite logs: `npx supabase functions logs ai-chat`

### "Build neće raditi"
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 CHECKLIST ZA DEPLOYMENT

- [ ] Environment variables su pravilno postavljene
- [ ] Frontend build je uspešan (npm run build)
- [ ] Supabase je povezan (npx supabase link)
- [ ] Database migracije su primenjene
- [ ] AI funkcija je deployujem
- [ ] Login/Signup radi
- [ ] Profile Setup radi
- [ ] AI Chat radi
- [ ] Job Search radi
- [ ] Saved Jobs radi
- [ ] RLS politike su testirane

---

## 🎓 RESURSI

- **Supabase Docs**: https://supabase.com/docs
- **Vite Guide**: https://vitejs.dev/guide/
- **React Docs**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 🤝 SLEDEĆE FAZE

1. **QA Testing** sa pravim korisnicima
2. **Performance Monitoring** sa Supabase Analytics
3. **User Feedback** integracija
4. **Feature Expansion**:
   - Video intervjui
   - Payment integration
   - Advanced matching algoritmi
   - Mobile app

---

## 📞 PODRŠKA

Za probleme, koristi:
- Supabase Support: https://supabase.com/support
- GitHub Issues (ako napraviš repo)
- Lokalni debugging sa console.log()

---

**Uspešne sa razvojem! 🚀**

Kreirano: 29.01.2026
Verzija: 1.0 - Production Ready
