# Baza podataka - NeonConnect

## Struktura baze

Ova SQL skripta kreira kompletan schema za NeonConnect platformu.

### Tabele:

1. **users** - Osnovna korisnika tabela sa ulogom
2. **candidate_profiles** - Profili kandidata
3. **employer_profiles** - Profili poslodavaca
4. **jobs** - Objavljeni poslovi
5. **applications** - Aplikacije kandidata na poslove

## Kako inicijalizovati?

### Opcija 1: Supabase Dashboard
1. Idi na https://app.supabase.com
2. Napravi novi projekat ili koristi postojeći
3. Idi na SQL Editor
4. Prosledi ceo sadržaj `schema.sql` fajla
5. Izvršite sve upite

### Opcija 2: Korišćenje SQL skripte
```bash
psql -U postgres -h localhost -d neonconnect < schema.sql
```

## Ključne karakteristike:

- ✅ UUID primarni ključevi
- ✅ Referentni integritet (Foreign Keys)
- ✅ Row Level Security (RLS) za sigurnost
- ✅ Automatski updated_at timestamps
- ✅ Indeksi za brze upite
- ✅ Validacija vrednosti (CHECK constraints)

## Supabase Auth integracija

Supabase automatski kreira `auth.users` tabelu. Aplikacija povezuje:
- `public.users.id` ← `auth.users.id`

## Kako koristiti RLS?

RLS je već konfigurisano, što znači:
- Korisnici mogu čitati samo svoje podatke (uz neke izuzetke)
- Javni mogu čitati aktivne poslove
- Samo autentifikovani korisnici mogu pisati

Za više informacija, vidi [Supabase RLS dokumentaciju](https://supabase.com/docs/guides/auth/row-level-security)
