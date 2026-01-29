@echo off
REM NeonConnect - DEPLOYMENT VERIFICATION SCRIPT (Windows)
REM Usage: Run in project root directory

echo 🔍 NeonConnect Deployment Verification Script
echo ==============================================
echo.

REM Check 1: Frontend build
echo ✓ Checking frontend build...
cd frontend
call npm run build > nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo   ✅ Frontend build: SUCCESS
) else (
    echo   ❌ Frontend build: FAILED
    exit /b 1
)
cd ..

REM Check 2: Frontend dependencies
echo ✓ Checking frontend dependencies...
if exist "frontend\node_modules" (
    echo   ✅ Dependencies installed
) else (
    echo   ⚠️  Dependencies not installed, run: cd frontend ^&^& npm install
)

REM Check 3: Supabase CLI
echo ✓ Checking Supabase CLI...
where npx > nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo   ✅ Supabase CLI available
) else (
    echo   ❌ Supabase CLI not found
)

REM Check 4: Database files
echo ✓ Checking database files...
if exist "database\schema.sql" (
    echo   ✅ schema.sql found
) else (
    echo   ❌ schema.sql missing
)

if exist "database\migrations\007_fix_rls_policies.sql" (
    echo   ✅ Migration 007 found
) else (
    echo   ⚠️  Migration 007 missing
)

if exist "database\migrations\008_complete_rls_fixes.sql" (
    echo   ✅ Migration 008 found
) else (
    echo   ⚠️  Migration 008 missing
)

REM Check 5: Supabase functions
echo ✓ Checking Supabase functions...
if exist "supabase\functions\ai-chat\index.ts" (
    echo   ✅ ai-chat function found
) else (
    echo   ❌ ai-chat function missing
)

REM Check 6: Configuration files
echo ✓ Checking configuration files...
if exist "frontend\.env" (
    echo   ✅ frontend\.env found
) else (
    echo   ⚠️  frontend\.env missing - needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
)

if exist "netlify.toml" (
    echo   ✅ netlify.toml found
) else (
    echo   ⚠️  netlify.toml missing
)

REM Check 7: Utilities
echo ✓ Checking utility files...
if exist "frontend\src\utils\cyrillic.ts" (
    echo   ✅ cyrillic.ts utility found
) else (
    echo   ❌ cyrillic.ts utility missing
)

REM Check 8: Documentation
echo ✓ Checking documentation...
setlocal enabledelayedexpansion
set docs_found=0
for %%F in (SETUP_GUIDE.md DEPLOYMENT_COMPLETE.md FINAL_STATUS_REPORT.md) do (
    if exist "%%F" (
        echo   ✅ %%F found
        set /a docs_found+=1
    )
)

if %docs_found% lss 3 (
    echo   ⚠️  Some documentation missing
)

echo.
echo ==============================================
echo ✅ Verification Complete!
echo.
echo Next steps:
echo 1. Set environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
echo 2. Verify Supabase project link: npx supabase link
echo 3. Check functions: npx supabase functions list
echo 4. Start development: cd frontend ^&^& npm run dev
echo.
echo For detailed setup instructions, see: SETUP_GUIDE.md
echo For deployment status, see: FINAL_STATUS_REPORT.md
echo.
pause
