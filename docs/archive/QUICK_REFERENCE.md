# 📋 NeonConnect - QUICK REFERENCE CARD

**Print this or save as bookmark!**

---

## 🚀 GETTING STARTED (5 minutes)

### 1. Setup Environment Variables
```
Create: frontend/.env
Add:
  VITE_SUPABASE_URL=https://vkxkzgjdluusviccnsdw.supabase.co
  VITE_SUPABASE_ANON_KEY=<from-supabase-dashboard>
```

### 2. Install & Run
```bash
cd frontend
npm install
npm run dev
```

### 3. Access Platform
Open: http://localhost:5173

---

## 📚 DOCUMENTATION QUICK LINKS

| Need | Document | Time |
|------|----------|------|
| Setup instructions | [SETUP_GUIDE.md](SETUP_GUIDE.md) | 10 min |
| Project status | [FINAL_STATUS_REPORT.md](FINAL_STATUS_REPORT.md) | 10 min |
| All documents | [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | 2 min |
| Deployment | [DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md) | 5 min |
| Security | [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md) | 10 min |
| AI features | [AI_CHAT_IMPROVEMENTS_SUMMARY.md](AI_CHAT_IMPROVEMENTS_SUMMARY.md) | 10 min |
| Database | [database/README.md](database/README.md) | 5 min |
| Testing | [docs/TESTING_GUIDE_DRAGA.md](docs/TESTING_GUIDE_DRAGA.md) | 15 min |

---

## 🔧 ESSENTIAL COMMANDS

### Development
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
```

### Database
```bash
npx supabase db push      # Apply migrations to remote
npx supabase db list      # List all tables
npx supabase studio       # Open Supabase Studio
```

### Functions
```bash
npx supabase functions logs ai-chat    # View function logs
npx supabase functions deploy ai-chat  # Deploy function
```

### Verification
```bash
# Windows
verify-deployment.bat

# Linux/Mac
./verify-deployment.sh
```

---

## 🔐 SECURITY ESSENTIALS

✅ **Always Do**:
- Store API keys in `.env` (never in code)
- Use `.env.local` for personal keys
- Keep `VITE_SUPABASE_ANON_KEY` confidential
- Enable 2FA on Supabase account
- Rotate keys monthly

❌ **Never Do**:
- Commit `.env` to git
- Share API keys in messages
- Use production keys in development
- Disable RLS on tables
- Store passwords in plain text

---

## 🐛 QUICK TROUBLESHOOTING

### Build Fails
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Can't Connect to Supabase
1. Check `.env` has correct URLs
2. Verify internet connection
3. Check https://status.supabase.com

### AI Chat Not Working
```bash
npx supabase functions logs ai-chat
# Check for errors in output
```

### RLS Policy Errors
- Ensure user is authenticated
- Check user ID in database
- Verify RLS policy allows the operation

---

## 📊 PROJECT STRUCTURE AT A GLANCE

```
NeonConnect/
├── frontend/          (React app)
│   ├── src/
│   │   ├── components/    (React components)
│   │   ├── services/      (API integrations)
│   │   ├── pages/         (Page components)
│   │   └── utils/         (Helper functions)
│   └── package.json
│
├── database/          (PostgreSQL)
│   ├── schema.sql     (Database tables)
│   └── migrations/    (Schema updates)
│
├── supabase/          (Edge Functions)
│   └── functions/
│       └── ai-chat/   (AI chatbot function)
│
└── 📖 Documentation/  (Setup guides, etc.)
```

---

## 🎯 COMMON TASKS

### Start Development
```bash
cd frontend && npm run dev
# Navigate to http://localhost:5173
```

### Build for Production
```bash
cd frontend && npm run build
# Output in: frontend/dist/
```

### Push Database Changes
```bash
npx supabase db push
# All migrations applied
```

### Deploy to Netlify (Production)
```bash
# See: docs/NETLIFY.md for detailed steps
npm run build
netlify deploy --prod
```

### Check What Changed
```bash
git status
git diff
```

### View Database
```bash
npx supabase studio
# Opens Supabase web interface
```

---

## 🔍 SUPABASE PROJECT INFO

**Project ID**: vkxkzgjdluusviccnsdw

**Dashboard**: https://supabase.com/dashboard/project/vkxkzgjdluusviccnsdw

**Database**: https://vkxkzgjdluusviccnsdw.supabase.co

**API Function**: https://vkxkzgjdluusviccnsdw.supabase.co/functions/v1/ai-chat

**Settings Path**: 
1. Dashboard → Settings → API
2. Copy: Project URL, anon key

---

## 📱 TESTING CHECKLIST

- [ ] Signup/Login works
- [ ] Profile setup wizard loads
- [ ] AI chat responds
- [ ] Job search works
- [ ] Can save jobs
- [ ] Can apply to jobs
- [ ] Logout works
- [ ] Mobile view responsive

---

## 🚀 DEPLOYMENT FLOW

```
1. Development
   └─ npm run dev
   
2. Testing
   └─ Manual QA testing
   
3. Build
   └─ npm run build
   
4. Production Deploy
   └─ Frontend: Netlify (docs/NETLIFY.md)
   └─ Backend: Already on Supabase ✅
   └─ Functions: Already deployed ✅
   
5. Monitoring
   └─ Setup error tracking (Sentry)
   └─ Setup analytics
   └─ Monitor performance
```

---

## 💡 TIPS & TRICKS

**Faster Development**:
- Use `npm run dev` for hot reload
- Open DevTools (F12) for debugging
- Check browser console for errors

**Database Debugging**:
- Use Supabase Studio for visual queries
- Check RLS policies in Settings
- View query performance in Analytics

**Performance**:
- Build is optimized (gzip ~135 KB)
- CSS is minified (8.36 KB gzipped)
- Use browser DevTools Performance tab

**Security Check**:
- Never log API keys
- Use environment variables
- Verify .env.local not in git

---

## 📞 HELP RESOURCES

**In This Project**:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - All guides
- [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md) - Security info

**External Resources**:
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org)

---

## 🎯 STATUS AT A GLANCE

| Component | Status | Action |
|-----------|--------|--------|
| Frontend | ✅ Ready | `npm run dev` to start |
| Database | ✅ Ready | Migrations applied |
| Functions | ✅ Ready | ai-chat deployed |
| Auth | ✅ Ready | Supabase configured |
| Docs | ✅ Ready | Read SETUP_GUIDE.md |

---

## 📝 IMPORTANT DATES

- **Completed**: 29.01.2026
- **Status**: Production Ready
- **Version**: 1.0
- **Next Review**: 30 days

---

## 🎉 YOU'RE ALL SET!

Everything is configured and ready to use.

**Next Step**: Open [SETUP_GUIDE.md](SETUP_GUIDE.md)

**Questions?**: Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

**Status?**: See [FINAL_STATUS_REPORT.md](FINAL_STATUS_REPORT.md)

---

**Last Updated**: 29.01.2026 | **Printed**: ___________

Keep this card handy for quick reference! ✨
