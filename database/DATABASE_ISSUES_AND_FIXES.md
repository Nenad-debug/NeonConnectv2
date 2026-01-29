# Database Issues Found and Fixed

## 🔍 Pronađene Greške u Bazi Podataka

### 1. **KRITIČNA GREŠKA: Pogrešne Foreign Key Reference** ❌
**Fajl**: `schema.sql`
**Problem**: 
- Jobs tabela je referencirala `employer_profiles(user_id)` umesto `users(id)`
- Applications tabela je referencirala `candidate_profiles(user_id)` umesto `users(id)`
- Ovo je uzrokovalo probleme sa RLS politikama jer se ne mogu direktno pristupiti employer_id

**Ispravka**: ✅
```sql
-- POGREŠNO:
ALTER TABLE public.jobs
  ADD CONSTRAINT fk_jobs_employer FOREIGN KEY (employer_id) 
  REFERENCES public.employer_profiles(user_id);

-- ISPRAVNO:
ALTER TABLE public.jobs
  ADD CONSTRAINT fk_jobs_employer FOREIGN KEY (employer_id) 
  REFERENCES public.users(id);
```

---

### 2. **GREŠKA: Nepotpune RLS Politike za employer_profiles** ❌
**Fajl**: `schema.sql`
**Problem**: 
- Employers nisu mogli ažurirati svoje profile (nedostajalo je UPDATE policy)
- Nije bilo INSERT policy za employers

**Ispravka**: ✅
```sql
CREATE POLICY "Employers can update own profile" ON public.employer_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can insert own profile" ON public.employer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

### 3. **GREŠKA: Nejasna RLS za jobs** ❌
**Fajl**: `schema.sql`
**Problem**: 
- Samo `status = 'active'` je mogao biti vidljiv
- Employer nije mogao videti svoje draft poslove

**Ispravka**: ✅
```sql
-- POGREŠNO:
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs
  FOR SELECT USING (status = 'active');

-- ISPRAVNO:
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs
  FOR SELECT USING (status = 'active' OR auth.uid() = employer_id);
```

---

### 4. **GREŠKA: Nepotpune RLS Politike za applications** ❌
**Fajl**: `schema.sql`
**Problem**: 
- Employers nisu mogli čitati aplikacije za svoje poslove
- Employers nisu mogli ažurirati status aplikacija
- Samo INSERT politika je bila dostupna

**Ispravka**: ✅
```sql
CREATE POLICY "Employers can read applications for their jobs" ON public.applications
  FOR SELECT USING (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id));

CREATE POLICY "Employers can update applications for their jobs" ON public.applications
  FOR UPDATE USING (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id))
  WITH CHECK (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id));
```

---

### 5. **GREŠKA: Pogrešna RLS za chat_messages** ❌
**Fajl**: `006_create_chat_messages.sql`
**Problem**: 
- Policy "System can update messages" dozvoljavao je svakome da ažurira poruke
- Nije bilo trigger-a za `updated_at` kolonu
- Nije bilo politike za brisanje poruka

**Ispravka**: ✅
```sql
-- POGREŠNO:
CREATE POLICY "System can update messages" ON public.chat_messages
  FOR UPDATE USING (true);

-- ISPRAVNO:
CREATE POLICY "Users can update own messages" ON public.chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON public.chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Dodaj trigger:
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### 6. **GREŠKA: Nedostaju SELECT politike za UPDATE** ❌
**Fajl**: `schema.sql`
**Problem**: 
- Employers nisu mogli ažurirati poslove jer je nedostajalo WITH CHECK

**Ispravka**: ✅
```sql
CREATE POLICY "Employers can update own jobs" ON public.jobs
  FOR UPDATE USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
```

---

## 🆕 Nove Features Dodane

### 7. **saved_jobs Tabela** ✨
Omogućava kandidatima da čuvaju posao kao favorit
```sql
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id),
  job_id UUID NOT NULL REFERENCES public.jobs(id),
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, job_id)
);
```

### 8. **notifications Tabela** ✨
Sistem notifikacija za sve aplikante
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. **Soft Delete za applications** ✨
```sql
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT NULL;
```

---

## 📊 Performance Optimizations

### 10. **Dodatni Indexi Dodani** 🚀
```sql
CREATE INDEX idx_candidate_profiles_profile_complete ON public.candidate_profiles(profile_complete);
CREATE INDEX idx_jobs_remote ON public.jobs(remote);
CREATE INDEX idx_jobs_experience_level ON public.jobs(experience_level);
CREATE INDEX idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX idx_chat_messages_user_created ON public.chat_messages(user_id, created_at DESC);
```

---

## 🔐 Storage Improvements

### 11. **Resumes Bucket** ✨
Dodao sam novu `resumes` kanta za PDF-ove
```sql
CREATE POLICY "Users can upload resumes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');
```

---

## ✅ Svim Greškama su Ispravke u:
1. **`007_fix_rls_policies.sql`** - Kompletna migracija sa svim ispravkama
2. **Ažuriran `schema.sql`** - Ispravljene sve referentne greške

## 🚀 Kako Primeniti Ispravke:

### Ako koristiš Supabase CLI:
```bash
supabase db push migrations/007_fix_rls_policies.sql
```

### Ako koristiš Supabase Web Dashboard:
1. Idi na SQL Editor
2. Kopira sadržaj iz `007_fix_rls_policies.sql`
3. Pokreni query

### Ako primenjuješ iz `schema.sql`:
Već su ispravljene sve reference - schema će sada raditi ispravno.

---

## 📋 Sumiran Popis Grešaka

| # | Problem | Severnost | Status |
|---|---------|-----------|--------|
| 1 | Pogrešne FK reference (jobs, applications) | 🔴 KRITIČNA | ✅ Ispravljeno |
| 2 | Nepotpune RLS za employer_profiles | 🟡 VISOKA | ✅ Ispravljeno |
| 3 | Nejasna RLS za jobs (draft ne vidljivi) | 🟡 VISOKA | ✅ Ispravljeno |
| 4 | Nepotpune RLS za applications | 🟡 VISOKA | ✅ Ispravljeno |
| 5 | Loše RLS za chat_messages | 🟡 VISOKA | ✅ Ispravljeno |
| 6 | Nedostaju WITH CHECK u UPDATE policy | 🟡 SREDNJA | ✅ Ispravljeno |
| 7 | Nema trigger-a za chat_messages updated_at | 🟢 NISKA | ✅ Dodano |
| 8 | Nedostaje saved_jobs tabela | 🟢 NISKA | ✅ Dodano |
| 9 | Nedostaje notifications sistem | 🟢 NISKA | ✅ Dodano |
| 10 | Nedostaju performance indexi | 🟢 NISKA | ✅ Dodano |
| 11 | Storage za resumes nedostaje | 🟢 NISKA | ✅ Dodano |
