# Supabase Database Schema - Ispravljena Verzija

## 📋 Struktura Podataka

```
┌─────────────────────────────────────────────────────────────┐
│                      AUTH (Supabase Auth)                   │
│  - id (UUID)                                                │
│  - email (TEXT)                                             │
│  - password_hash (managed by Supabase)                      │
└─────────────┬───────────────────────────────────────────────┘
              │
    ┌─────────┴──────────┬──────────────────┐
    │                    │                  │
    ▼                    ▼                  ▼
┌──────────┐      ┌────────────────┐  ┌─────────────────┐
│  users   │◄─────┤ candidate_     │  │  employer_      │
│          │      │ profiles       │  │  profiles       │
│ id (PK)  │      │ (user_id FK)   │  │  (user_id FK)   │
│ email    │      │ first_name     │  │  company_name   │
│ role     │      │ last_name      │  │  company_site   │
│ created  │      │ bio            │  │  description    │
│ updated  │      │ skills[]       │  │  logo_url       │
│ confirmed│      │ experience_yrs │  │  created        │
│ pwd_reset│      │ education[]    │  │  updated        │
└──────────┘      │ certifications │  └─────────────────┘
     │            │ languages[]    │
     │            │ location       │
     │            │ profile_image  │
     │            │ github_url     │
     │            │ linkedin_url   │
     │            │ website        │
     │            │ profile_compl  │
     │            └────────────────┘
     │
     │
     ├──────────────┬────────────────┬────────────────┐
     │              │                │                │
     ▼              ▼                ▼                ▼
┌─────────┐    ┌──────────┐    ┌────────────┐  ┌──────────┐
│   jobs  │    │chat_msgs │    │  saved_    │  │notific-  │
│         │    │          │    │  jobs      │  │ ations   │
│ id (PK) │    │ id (PK)  │    │ id (PK)    │  │ id (PK)  │
│ title   │    │ role     │    │ user_id(FK)│  │ user_id(FK)
│ descr   │    │ content  │    │ job_id(FK) │  │ type     │
│ emp_id◄─┼───►│ user_id◄─┼───┤ saved_at   │  │ title    │
│ salary  │    │ context  │    │            │  │ message  │
│ location│    │ created  │    └────────────┘  │ related_ │
│ job_type│    │ updated  │                    │ id       │
│ remote  │    └──────────┘                    │ is_read  │
│ exp_lvl │                                    │ created  │
│ skills[]│                                    │ updated  │
│ tags[]  │                                    └──────────┘
│ slug    │
│ status  │
│ created │
│ updated │
└──────────────────────────────────────┬─────────────────────┐
                                       │                     │
                                       ▼                     ▼
                               ┌──────────────┐  ┌─────────────────┐
                               │applications  │  │  job_stats      │
                               │              │  │                 │
                               │ id (PK)      │  │ id (PK)         │
                               │ job_id(FK)   │  │ job_id(FK)      │
                               │ candidate_id │  │ views_count     │
                               │ (user_id FK) │  │ applications    │
                               │ cover_letter │  │ last_viewed_at  │
                               │ status       │  │ created         │
                               │ archived_at  │  │ updated         │
                               │ created      │  └─────────────────┘
                               │ updated      │
                               └──────────────┘
```

## 🗝️ Ključne Veze (Foreign Keys)

### ✅ ISPRAVILE SE:
- **jobs.employer_id** → `public.users(id)` ✅
- **applications.candidate_id** → `public.users(id)` ✅
- Svi cascading deletes su postavljeni kao `ON DELETE CASCADE`

### ✅ Ispravljene RLS Politike:

#### Employers mogu:
- ✅ Čitati svoje profile
- ✅ Ažurirati svoje profile
- ✅ Praviti nove poslove
- ✅ Ažurirati svoje poslove
- ✅ Brisati svoje poslove
- ✅ Čitati aplikacije za svoje poslove
- ✅ Ažurirati status aplikacija

#### Candidates mogu:
- ✅ Čitati sve aktivne poslove
- ✅ Čitati svoje profile
- ✅ Ažurirati svoje profile
- ✅ Aplicirati za poslove
- ✅ Čitati svoje aplikacije
- ✅ Ažurirati svoje aplikacije
- ✅ Spasavati poslove kao favorite
- ✅ Čitati svoje poruke sa AI-om
- ✅ Brisati svoje poruke

## 📊 Tabele Detaljno

### `users` (iz auth.users)
```sql
id UUID PRIMARY KEY
email TEXT UNIQUE
role TEXT ('candidate' | 'employer')
confirmed_at TIMESTAMP
password_reset_used BOOLEAN
password_reset_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

### `candidate_profiles`
```sql
id UUID PRIMARY KEY
user_id UUID UNIQUE (references users)
first_name TEXT
last_name TEXT
bio TEXT
skills TEXT[] (array of strings)
resume_url TEXT
phone TEXT
location TEXT
experience_years INTEGER
profile_image_url TEXT
education TEXT[]
certifications TEXT[]
languages TEXT[]
website TEXT
github_url TEXT
linkedin_url TEXT
profile_complete BOOLEAN (default: false)
created_at TIMESTAMP
updated_at TIMESTAMP
```

### `employer_profiles`
```sql
id UUID PRIMARY KEY
user_id UUID UNIQUE (references users)
company_name TEXT
company_website TEXT
logo_url TEXT
description TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

### `jobs`
```sql
id UUID PRIMARY KEY
employer_id UUID (references users) ✅ ISPRAVLJEN
title TEXT
description TEXT
category TEXT
salary_min INTEGER
salary_max INTEGER
salary_currency TEXT
salary_type TEXT ('yearly' | 'monthly' | 'hourly' | 'negotiable')
location TEXT (ili JSONB sa city, country, lat, lng)
job_type TEXT ('full-time' | 'part-time' | 'contract' | 'freelance')
remote BOOLEAN
experience_level TEXT ('junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'intern')
required_skills TEXT[]
skills TEXT[]
tags TEXT[]
slug TEXT (unique)
search_vector tsvector (za full-text search)
status TEXT ('active' | 'closed' | 'draft')
published_at TIMESTAMP
expires_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

### `applications`
```sql
id UUID PRIMARY KEY
job_id UUID (references jobs)
candidate_id UUID (references users) ✅ ISPRAVLJEN
cover_letter TEXT
status TEXT ('pending' | 'reviewed' | 'accepted' | 'rejected')
archived_at TIMESTAMP (soft delete)
created_at TIMESTAMP
updated_at TIMESTAMP
UNIQUE(job_id, candidate_id)
```

### `chat_messages`
```sql
id UUID PRIMARY KEY
user_id UUID (references users)
role TEXT ('user' | 'assistant')
content TEXT
context TEXT (profile_setup | general | job_search | employer)
created_at TIMESTAMP
updated_at TIMESTAMP
```

### `saved_jobs` (NEW ✨)
```sql
id UUID PRIMARY KEY
user_id UUID (references users)
job_id UUID (references jobs)
saved_at TIMESTAMP
UNIQUE(user_id, job_id)
```

### `notifications` (NEW ✨)
```sql
id UUID PRIMARY KEY
user_id UUID (references users)
type TEXT (application_status | new_job | message | etc)
title TEXT
message TEXT
related_id UUID
is_read BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

### `job_stats` (NEW ✨)
```sql
id UUID PRIMARY KEY
job_id UUID UNIQUE (references jobs)
views_count INTEGER
applications_count INTEGER
last_viewed_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

### `audit_logs` (NEW ✨)
```sql
id UUID PRIMARY KEY
user_id UUID (references users, nullable)
action TEXT
table_name TEXT
record_id UUID
old_data JSONB
new_data JSONB
created_at TIMESTAMP
```

## 🔐 Storage Buckets

### `avatars` (profil slike)
- Javni pristup (public read)
- Authenticirani upload
- Korisnici brišu svoje slike

### `resumes` (CV)
- Authenticirani pristup
- Korisnici brišu svoje CVe

## 📈 Indexi za Performance

```sql
-- Jobs
idx_jobs_employer_id
idx_jobs_status
idx_jobs_created_at (DESC)
idx_jobs_slug_unique
idx_jobs_search_vector (GIN)
idx_jobs_skills (GIN)
idx_jobs_tags (GIN)
idx_jobs_location (JSONB)
idx_jobs_remote
idx_jobs_experience_level

-- Applications
idx_applications_job_id
idx_applications_candidate_id
idx_applications_status
idx_applications_created_at (DESC)

-- Chat Messages
idx_chat_messages_user_id
idx_chat_messages_created_at (DESC)
idx_chat_messages_user_created (composite)

-- Candidate Profiles
idx_candidate_profile_complete
idx_candidate_profiles_profile_complete

-- Saved Jobs
idx_saved_jobs_user_id
idx_saved_jobs_job_id

-- Notifications
idx_notifications_user_id
idx_notifications_created_at (DESC)
idx_notifications_is_read

-- Job Stats
idx_job_stats_job_id

-- Audit Logs
idx_audit_logs_user_id
idx_audit_logs_created_at (DESC)
idx_audit_logs_table_name
```

## 🔄 Triggers

- `update_users_updated_at` - ažurira `updated_at` kad se user ažurira
- `update_candidate_profiles_updated_at` - ažurira `updated_at` za candidate profile
- `update_employer_profiles_updated_at` - ažurira `updated_at` za employer profile
- `update_jobs_updated_at` - ažurira `updated_at` za jobs
- `update_applications_updated_at` - ažurira `updated_at` za applications
- `update_chat_messages_updated_at` - ažurira `updated_at` za chat messages
- `update_notifications_updated_at` - ažurira `updated_at` za notifications
- `update_job_stats_updated_at` - ažurira `updated_at` za job stats
- `trg_update_jobs_search_vector` - ažurira `search_vector` za full-text search

---

**Poslednja Ažuriranja**: 29.01.2026
**Verzija**: 2.0 (Ispravljena)
**Status**: ✅ Sve Greške Ispravljene
