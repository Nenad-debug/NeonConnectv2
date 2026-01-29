# NeonConnect Database - Kompletna Dokumentacija

## ⚠️ VAŽNO: Pronađene i Ispravljene Greške (v2.0)

**Status**: ✅ Sve greške su ispravljene i testate!

### Pronađene Kritične Greške:

| # | Problem | Severnost | Status |
|---|---------|-----------|--------|
| 1 | Pogrešne Foreign Key reference (jobs, applications) | 🔴 KRITIČNA | ✅ Ispravljeno |
| 2 | Nepotpune RLS politike | 🟡 VISOKA | ✅ Ispravljeno |
| 3 | Nedostaju update/delete politike | 🟡 VISOKA | ✅ Ispravljeno |
| 4 | Loše RLS za chat_messages | 🟡 VISOKA | ✅ Ispravljeno |
| 5 | Nedostaju performance indexi | 🟢 NISKA | ✅ Dodano |

## 📋 Pregled

Ova direktzija sadrži kompletan SQL schema za **NeonConnect** - platformu za pronalaženje poslova sa AI asistentom.

## 📁 Fajlovi

```
database/
├── schema.sql                          ✅ Ispravljeni main schema
├── storage-setup.sql                   Supabase Storage konfiguracija
├── 007_fix_rls_policies.sql            ✅ RLS popravke
├── 008_complete_rls_fixes.sql          ✅ Dodatne RLS popravke
├── DATABASE_ISSUES_AND_FIXES.md        📄 Detalje o svim greškama
├── SCHEMA_DIAGRAM.md                   📊 Dijagram strukture
└── migrations/
    ├── 002_extend_jobs.sql             Advanced job fields
    ├── 003_add_confirmed_at_users.sql   Email confirmation
    ├── 004_add_password_reset_to_users.sql  Password reset
    ├── 005_extend_candidate_profiles.sql    Extended profile fields
    └── 006_create_chat_messages.sql         AI chat history
```

## 🚀 Setup

### Brzo (Preporučeno)

```bash
# 1. Go to Supabase Dashboard
# 2. SQL Editor
# 3. Run schema.sql (sve ispravke su već uključene)
# 4. Run migrations 007 i 008 za dodatne features
```

### Sa Supabase CLI

```bash
# Linux/Mac
supabase db push

# Windows (sa npx)
npx supabase db push
```

## 🔑 Glavne Tabele

### `users` (authentication)
```
- id, email, role (candidate|employer)
- confirmed_at, password_reset fields
- created_at, updated_at
```

### `candidate_profiles`
```
- Detaljne info: skills, education, experience, languages
- Social links: github, linkedin, website
- profile_image_url, resume_url
- profile_complete (boolean za tracking)
```

### `employer_profiles`
```
- company_name, website, logo
- description, contact info
```

### `jobs`
```
- title, description, location, salary
- job_type, experience_level, remote
- skills[], tags[]
- search_vector (za full-text search)
- status (active|draft|closed)
```

### `applications`
```
- job_id → jobs
- candidate_id → users (✅ Ispravljeno - bio candidate_profiles)
- status, cover_letter
- archived_at (soft delete)
```

### `chat_messages` (AI Assistant)
```
- user_id, role (user|assistant)
- content, context
- created_at, updated_at (✅ Fixed trigger)
```

### `saved_jobs` (NEW ✨)
```
- user_id, job_id
- saved_at
- Omogućava kandidatima da čuvaju poslove
```

### `notifications` (NEW ✨)
```
- user_id, type, title, message
- is_read tracking
- created_at, updated_at
```

## 🔐 Row Level Security (RLS)

### Candidates mogu:
✅ Čitati sve aktivne poslove
✅ Čitati svoj profil
✅ Ažurirati svoj profil
✅ Aplikovati za poslove
✅ Čitati svoje aplikacije
✅ Čuvati poslove kao favorite
✅ Čitati i brisati svoje chat poruke

### Employers mogu:
✅ Čitati svoj profil
✅ Ažurirati svoj profil
✅ Kreirati i ažurirati poslove
✅ Čitati aplikacije za svoje poslove
✅ Ažurirati status aplikacija
✅ Vidjeti draft poslove (prije nego što se objave)

## 📊 Performance Optimizations

Dodani indexi za:
- Jobs search (title, description via tsvector)
- Filtering (status, experience_level, remote)
- User lookups (candidate_profiles.profile_complete)
- Chat performance (user_id, created_at composite)

## 🗄️ Storage Buckets

### `avatars` (Javno dostupno)
```
- Profil slike kandidata
- Javni read, auth upload, vlasnik delete
```

### `resumes` (Privatno)
```
- PDF dokumenti
- Auth read/upload, vlasnik delete
```

## 📝 Migracije

**Redosled primene**:
1. `schema.sql` (main)
2. `002_extend_jobs.sql` 
3. `003_add_confirmed_at_users.sql`
4. `004_add_password_reset_to_users.sql`
5. `005_extend_candidate_profiles.sql`
6. `006_create_chat_messages.sql`
7. `007_fix_rls_policies.sql` ✅ VAŽNA
8. `008_complete_rls_fixes.sql` ✅ VAŽNA

## 🧪 Testiranje

```sql
-- Test kao candidate
SET ROLE authenticated;
SET request.jwt.claims = '{"sub":"<candidate-uuid>"}';
SELECT * FROM jobs WHERE status = 'active'; -- Trebalo bi da radi

-- Test kao employer
SET ROLE authenticated;
SET request.jwt.claims = '{"sub":"<employer-uuid>"}';
SELECT * FROM jobs WHERE employer_id = '<employer-uuid>'; -- Trebalo bi da radi
```

## 📄 Detaljne Greške i Popravke

Detaljnu dokumentaciju svih pronađenih grešaka vidite u:
👉 **[DATABASE_ISSUES_AND_FIXES.md](./DATABASE_ISSUES_AND_FIXES.md)**

## 🏗️ Arhitektura Podataka

Detaljnu ASCII dijagram strukture vidite u:
👉 **[SCHEMA_DIAGRAM.md](./SCHEMA_DIAGRAM.md)**

## ⚙️ Česta Pitanja

### P: Zašto je employer_id reference `users.id` umesto `employer_profiles.user_id`?
**O**: Jer svaki employer ima samo jedan profil, a employer_id trebalo bi referentna na user_id direktno za lakši pristup u RLS politikama.

### P: Zašto candidate_id reference `users.id` umesto `candidate_profiles.user_id`?
**O**: Ista logika - svaki kandidat ima samo jedan profil.

### P: Da li trebam ručno da kreiram buckets?
**O**: ✅ `avatars` bucket se može kreirati kroz dashboard, ili putem `storage-setup.sql`

### P: Šta je `search_vector`?
**O**: PostgreSQL `tsvector` kolona za efikasnu full-text pretragu poslova po title i description.

## 📞 Support

Za probleme sa bazom, proverite:
1. [DATABASE_ISSUES_AND_FIXES.md](./DATABASE_ISSUES_AND_FIXES.md) - detaljne greške
2. [SCHEMA_DIAGRAM.md](./SCHEMA_DIAGRAM.md) - struktura podataka
3. Supabase Dashboard → Logs za SQL greške

---

**Verzija**: 2.0 ✅ (Sve Ispravljeno)
**Last Updated**: 29.01.2026
**Status**: Production Ready
