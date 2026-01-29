# 📋 Kako Dobiti Supabase Kredencijale

## 1. Idi na https://app.supabase.com

## 2. Otvorite Svoj Projekat

## 3. Idite na Settings → API

### Trebaju ti:
- **Project URL** - Izgleda kao: `https://xxxxx.supabase.co`
- **Anon Key** - Public key sa Project Settings
- **Service Role Key** - Secret key (samo za server-side)

---

## 🔐 Čuvaj Key-eve u Sigurnoj Lokaciji!

Nakon što dobiješ kredencijale, kreiraj `.env.local` fajl:

```env
# Frontend
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Backend/Migrations
SUPABASE_ACCESS_TOKEN=sbp_xxxxx
```

---

## 📊 Primeni Migracije Sa CLI

Kada imaš access token, pokreni:

```bash
# 1. Login (koristiš access token ili pretraživač)
npx supabase login

# 2. Link sa tvojim projektom
npx supabase link --project-ref xxxxx

# 3. Push sve migracije
npx supabase db push

# 4. Proverite status
npx supabase db pull
```

---

## ⚡ Brža Opcija - Direktno na Dashboard-u

Umesto CLI, možeš:

1. Idi na https://app.supabase.com/project/xxxxx/sql/new
2. Kopiraj sadržaj iz `database/007_fix_rls_policies.sql`
3. Klikni Run
4. Ponovi za `008_complete_rls_fixes.sql`

**GOTOVO!** 🎉
