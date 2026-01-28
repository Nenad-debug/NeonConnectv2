# Supabase Gemini Setup - Finalni Koraci

Sada trebam da završiš manuelnu konfiguraciju u Supabase. Evo kako:

## Korak 1: Otvori Supabase Settings

1. Idi na https://app.supabase.com/
2. Odaberi **NeonConnectV2** projekat
3. U levoj stranci klikni na ⚙️ **Settings**
4. U Settings, klikni na **API Keys** (trebalo bi da vidiš)

## Korak 2: Pronađi Secret Keys sekciju

Na stranici trebalo bi da vidiš dve sekcije:
- **Publishable key** (gornji deo)
- **Secret keys** (donji deo - OVO TREBAMO!)

## Korak 3: Obrisi stari "gemini" secret (ako postoji)

1. U **Secret keys** sekciji, pronađi red sa **"gemini"**
2. Klikni na tri tačke ⋮ na desnom kraju
3. Klikni **"Delete"**
4. Potvrdi brisanje

## Korak 4: Kreiraj novi secret

1. Klikni na **"+ New secret key"** dugme
2. Trebalo bi da se otvori forma sa poljima
3. Popuni:
   - **Name**: `GOOGLE_GEMINI_API_KEY`
   - **Value**: `AIzaSyAYRJK8NiHC1vLPP-HE125iB2Y_a94kEL8`
4. Klikni **"Add"** ili **"Save"**

## Korak 5: Verify

Nakon što kreijaš secret, trebalo bi da vidiš `GOOGLE_GEMINI_API_KEY` u Secret keys listi (prikazano kao točkice zbog sigurnosti).

---

## Kada završiš:

Javi mi kada si dodao secret, pa ću deployovati Edge Function!

---

**VAŽNO**: Taj API ključ je sada **SKRIVENA VREDNOST** u Supabase. Edge Function će ga automatski čitati iz Environment Variables.
