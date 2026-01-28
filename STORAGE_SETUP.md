# Supabase Storage Setup Instructions

## 📸 Avatars Bucket Setup

### Step 1: Create the `avatars` bucket in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: **NeonConnect**
3. Go to **Storage** section (left sidebar)
4. Click **Create New Bucket**
5. Name: `avatars`
6. Make it **Public** ✅
7. Click **Create**

### Step 2: Configure RLS Policies

1. After creating the bucket, click on `avatars` to open it
2. Go to **Policies** tab
3. Click **New Policy** and add these policies:

#### Policy 1: Allow Authenticated Users to Upload
```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);
```

#### Policy 2: Allow Public Read
```sql
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

#### Policy 3: Allow Users to Update Their Own Files
```sql
CREATE POLICY "Allow users to update their files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Allow Users to Delete Their Own Files
```sql
CREATE POLICY "Allow users to delete their files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 3: Verify Setup

After creating the bucket and policies:
- Try uploading a profile picture in the dashboard
- It should now work without RLS errors

---

## 🗄️ Database Setup

Run the migration in your Supabase SQL editor:

```sql
-- Run: database/migrations/005_extend_candidate_profiles.sql
```

This will add all necessary columns for candidate profile data.

---

## 📝 Notes

- Images are stored in `/avatars/` directory in Supabase Storage
- Public URLs follow pattern: `https://<your-project>.supabase.co/storage/v1/object/public/avatars/<filename>`
- All users can read (download) avatars
- Only authenticated users can upload
- Users can only update/delete their own files

---

## ❌ Troubleshooting

**Error: "new row violates row-level security policy"**
- Check that RLS policies are created correctly
- Make sure bucket is set to **Public**
- Verify user is authenticated

**Error: "Failed to upload image"**
- Check network tab in browser dev tools
- Ensure Supabase credentials are correct
- Verify bucket name is exactly `avatars`

**Images not displaying**
- Check if bucket is public
- Verify image URLs in database match actual bucket location
- Clear browser cache
