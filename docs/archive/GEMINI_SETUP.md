# Google Gemini API Setup Guide

Ovaj vodič vas vodi kroz sve korake potrebne da postavite Google Gemini API za AI asistenta u NeonConnect aplikaciji.

## 1. Preuzmite Google Gemini API Key

### Korak 1.1: Idite na Google AI Studio
- Otvorite https://ai.google.dev/
- Kliknite na "Get API key" dugme

### Korak 1.2: Kreirajte novi API ključ
- Kliknite na "Create API key"
- Izaberite "New project" ili postojeći projekat
- Google će automatski generisati API ključ za vas

### Korak 1.3: Kopujte API ključ
- Skenirajte ekran i kopujte generisani API ključ
- Čuvajte ga na sigurnom mestu (trebaće vam uskoro)

## 2. Postavite API Ključ u Supabase

### Korak 2.1: Idite na Supabase Dashboard
- Otvorite https://app.supabase.com/
- Odaberite vaš NeonConnect projekat

### Korak 2.2: Navigirajte na Edge Functions
1. U levoj stranci kliknite na "Settings"
2. Kliknite na "Secrets" ili "Environment variables"

### Korak 2.3: Dodajte novi secret
1. Kliknite na "New secret"
2. **Key**: `GOOGLE_GEMINI_API_KEY`
3. **Value**: [Vaš API ključ koji ste kopirali]
4. Kliknite "Save"

## 3. Deploy Edge Function

### Korak 3.1: Instalacija Supabase CLI
Ako nemate Supabase CLI instaliran, instalujte ga:

```bash
npm install -g supabase
```

### Korak 3.2: Login u Supabase
```bash
supabase login
```

### Korak 3.3: Deploy AI Chat Edge Function
```bash
cd c:\Users\malet\OneDrive\Desktop\NeonConnect
supabase functions deploy ai-chat
```

Ovo će:
- Deployovati `netlify/functions/ai-chat.ts` kao Edge Function
- Automatski će koristiti `GOOGLE_GEMINI_API_KEY` koji ste postavili
- Funkcija će biti dostupna na: `https://your-project.functions.supabase.co/ai-chat`

### Korak 3.4: Verifikujte deployment
```bash
supabase functions list
```

Trebao bi da vidite `ai-chat` funkciju u listi.

## 4. Pokrenite Database Migration

### Korak 4.1: Pokrenite SQL migration za chat messages

1. Otvorite Supabase Dashboard
2. Navigirajte na "SQL Editor"
3. Kliknite na "New query"
4. Kopujte sadržaj iz `database/migrations/006_create_chat_messages.sql`
5. Kliknite "Run"

Ovo će kreirati:
- `chat_messages` tabelu sa svim potrebnim poljima
- RLS (Row Level Security) politike
- Indekse za performanse

### Korak 4.2: Pokrenite migration za extended candidate profiles

1. U SQL Editor-u kliknite "New query" ponovo
2. Kopujte sadržaj iz `database/migrations/005_extend_candidate_profiles.sql`
3. Kliknite "Run"

Ovo će proširiti `candidate_profiles` tabelu sa svim profilnim poljima.

## 5. Kreirajte Storage Bucket za Slike

### Korak 5.1: Kreirajte 'avatars' bucket
1. U Supabase Dashboard, navigirajte na "Storage"
2. Kliknite "Create a new bucket"
3. **Name**: `avatars`
4. **Public bucket**: ✅ (proverite)
5. Kliknite "Create bucket"

### Korak 5.2: Postavite RLS politike

1. Odaberite `avatars` bucket
2. Kliknite na "Policies" tab
3. Kliknite "New policy" > "For authenticated users"

Dodajte sledeće politike:

**Policy 1: Upload**
- **Allowed operation**: SELECT
- **For**: Authenticated users
- **Target**: ✓ (All rows where auth.role() = 'authenticated')

**Policy 2: Insert**
- **Allowed operation**: INSERT
- **For**: Authenticated users
- **Target**: ✓ (All rows where auth.role() = 'authenticated')

**Policy 3: Delete**
- **Allowed operation**: DELETE
- **For**: Authenticated users
- **Target**: ✓ (All rows where auth.role() = 'authenticated' and bucket_id = 'avatars')

## 6. Testiranje

### Korak 6.1: Pokrenite dev server
```bash
cd frontend
npm run dev
```

### Korak 6.2: Pristupite aplikaciji
1. Otvorite http://localhost:5173
2. Prijavite se ili kreirajte nalog

### Korak 6.3: Testirajte AI asistenta

**U Profile Setup:**
1. Trebalo bi videti AI asistenta na desnoj strani
2. Pokušajte da postavite pitanje o popunjavanju profila
3. AI bi trebao da odgovori sa saveti

**Globalni AI asistent:**
1. Kliknite na floating button (plavunjastiu kuglici sa chat ikonom) u dnu desna
2. Trebalo bi da se otvori chat modal
3. Pokušajte da postavite bilo koje pitanje

## 7. Troubleshooting

### Greška: "Cannot find module 'aiService'"
- **Rešenje**: Proverite da li je `frontend/src/services/aiService.ts` pravi fajl
- Trebam da bude na putanji: `frontend/src/services/aiService.ts`

### Greška: "GOOGLE_GEMINI_API_KEY is undefined"
- **Rešenje**: Proverite da li ste postavili secret u Supabase
- Idite na Settings > Secrets i verifikujte da je postavljen
- Mogu trebati ~5 minuta da se secret sinkrionzuje

### AI asistent ne odgovara
- **Rešenje**: 
  1. Proverite da je Edge Function deployovan: `supabase functions list`
  2. Proverite da je `GOOGLE_GEMINI_API_KEY` ispravan
  3. Otvorite browser console (F12) i proverite za greške
  4. Proverite Network tab da vidite šta se šalje na Edge Function

### Chat se ne čuva
- **Rešenje**:
  1. Proverite da je `chat_messages` tabela kreirana
  2. Proverite RLS politike na tabeli
  3. Proverite u Supabase console da li se chat_messages podaci pojavljuju

## 8. Kako funkcioniše

### Profile Setup AI Asistent
- Prikazan je u kompaktnom modu desno od forme
- Ima context `"profile_setup"` - optimizovan za pomoć pri popunjavanju profila
- Koristi Edge Function: `/ai-chat`
- Čuva istoriju chat-a u `chat_messages` tabeli

### Globalni AI Asistent
- Dostupan je kao floating button sa chat ikonom
- Ima context `"general"` - može odgovoriti na bilo koja pitanja
- Dostupan je na svim stranicama aplikacije
- Čuva celu istoriju razgovora

### Kako Edge Function radi
1. Frontend šalje poruku: `{ message, context, previousMessages }`
2. Edge Function prima zahtev i validira API ključ
3. Kreira konverzaciju sa Google Gemini API
4. Vraća odgovore sa bezbednosnim filterima
5. Frontend čuva poruke u `chat_messages` tabeli

## 9. Sigurnost

- ✅ API ključ nikada nije izložen klijentu (čuva se u Supabase)
- ✅ Edge Function ima RLS politike - samo autentifikovani korisnici
- ✅ Svaka poruka je vezana za korisnika (user_id)
- ✅ Korisnici vide samo svoje poruke
- ✅ Bezbednosni filteri sprečavaju neprimerenu sadržaj

## 10. Sledeći koraci

Nakon što ste uspešno postavili AI asistenta:

1. **Testirajte**: Pokrenite aplikaciju i testirajte obe AI asistenta (u profilu i globalnu)
2. **Prilagodite**: Možete promeniti system prompts u `netlify/functions/ai-chat.ts`
3. **Monitor**: Proverite Supabase logs za greške ili probleme
4. **Deploj**: Kada ste zadovoljni, mergujte `feat/netlify-config` grana u main

## Korisni linkovi

- [Google AI Studio](https://ai.google.dev/)
- [Supabase Dashboard](https://app.supabase.com/)
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Gemini API Docs](https://ai.google.dev/docs)
