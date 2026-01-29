# Deploy na Netlify

Ovo su koraci i podešavanja za deploy tvoje Vite + React aplikacije na Netlify.

## Fajlovi koje sam dodao
- `public/_redirects`  — omogućava SPA fallback (`/* /index.html 200`).
- `netlify.toml` — Netlify konfiguracija (build command i redirect pravilo).

## Postavke u Netlify dashboardu
1. Konektuj repo (GitHub/GitLab/Bitbucket) i podesite branch za deploy.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. U **Site settings → Environment** dodaj env varove:
   - `VITE_SUPABASE_URL` = tvoj Supabase URL (npr. `https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` = tvoj public anon key
- `VITE_SITE_URL` = tvoj javni sajt (npr. `https://tvoj-sajt.netlify.app`)  # koristi se za redirect u email potvrdi
- U Supabase → Authentication → Settings:
  - **Site URL** postavi na Netlify URL (npr. `https://tvoj-sajt.netlify.app`)
  - **Redirect URLs**: dodaj `http://localhost:3000` (dev) i `https://tvoj-sajt.netlify.app` (prod)

### AI Chat funkcija (404 = funkcija nije pronađena)
- Funkcija mora biti u **frontend/netlify/functions/** jer Netlify traži funkcije u `base/netlify/functions` (base = frontend).
- U **Site settings → Environment** dodaj za **Functions**: `AIML_API_KEY` = tvoj AIML API ključ.
- Ako AI chat vraća 404: proveri da li je u repou `frontend/netlify/functions/ai-chat.ts` i da li je deploy uključio taj folder; ponovo deploy-uj.
- Lokalno: `netlify dev` (iz repo roota) pokreće i frontend i funkcije; sam `npm run dev` ne servira funkcije.

## Lokalno: kako deployovati
1. Dodaj i commituj fajlove:
```bash
git add public/_redirects netlify.toml docs/NETLIFY.md
git commit -m "chore: add Netlify config and redirects"
git push origin main
```
2. Na Netlify poveži repo i pokreni deploy.

Ako želiš, mogu i da napravim pull request sa ovim izmenama umesto direktnog commita — reci šta preferiraš.