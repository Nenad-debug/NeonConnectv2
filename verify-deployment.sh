#!/bin/bash
# NeonConnect - DEPLOYMENT VERIFICATION SCRIPT
# Usage: Run in project root directory

echo "🔍 NeonConnect Deployment Verification Script"
echo "=============================================="
echo ""

# Check 1: Frontend build
echo "✓ Checking frontend build..."
cd frontend
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Frontend build: SUCCESS"
else
    echo "  ❌ Frontend build: FAILED"
    exit 1
fi
cd ..

# Check 2: Frontend dependencies
echo "✓ Checking frontend dependencies..."
if [ -d "frontend/node_modules" ]; then
    echo "  ✅ Dependencies installed"
else
    echo "  ⚠️  Dependencies not installed, run: cd frontend && npm install"
fi

# Check 3: Supabase CLI
echo "✓ Checking Supabase CLI..."
which npx > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Supabase CLI available"
else
    echo "  ❌ Supabase CLI not found"
fi

# Check 4: Database files
echo "✓ Checking database files..."
if [ -f "database/schema.sql" ]; then
    echo "  ✅ schema.sql found"
else
    echo "  ❌ schema.sql missing"
fi

if [ -f "database/migrations/007_fix_rls_policies.sql" ]; then
    echo "  ✅ Migration 007 found"
else
    echo "  ⚠️  Migration 007 missing"
fi

if [ -f "database/migrations/008_complete_rls_fixes.sql" ]; then
    echo "  ✅ Migration 008 found"
else
    echo "  ⚠️  Migration 008 missing"
fi

# Check 5: Supabase functions
echo "✓ Checking Supabase functions..."
if [ -f "supabase/functions/ai-chat/index.ts" ]; then
    echo "  ✅ ai-chat function found"
else
    echo "  ❌ ai-chat function missing"
fi

# Check 6: Configuration files
echo "✓ Checking configuration files..."
if [ -f "frontend/.env" ]; then
    echo "  ✅ frontend/.env found"
else
    echo "  ⚠️  frontend/.env missing - needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
fi

if [ -f "netlify.toml" ]; then
    echo "  ✅ netlify.toml found"
else
    echo "  ⚠️  netlify.toml missing"
fi

# Check 7: Utilities
echo "✓ Checking utility files..."
if [ -f "frontend/src/utils/cyrillic.ts" ]; then
    echo "  ✅ cyrillic.ts utility found"
else
    echo "  ❌ cyrillic.ts utility missing"
fi

# Check 8: Documentation
echo "✓ Checking documentation..."
docs_found=0
for doc in "SETUP_GUIDE.md" "DEPLOYMENT_COMPLETE.md" "FINAL_STATUS_REPORT.md"; do
    if [ -f "$doc" ]; then
        echo "  ✅ $doc found"
        ((docs_found++))
    fi
done

if [ $docs_found -lt 3 ]; then
    echo "  ⚠️  Some documentation missing"
fi

echo ""
echo "=============================================="
echo "✅ Verification Complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY"
echo "2. Verify Supabase project link: npx supabase link"
echo "3. Check functions: npx supabase functions list"
echo "4. Start development: cd frontend && npm run dev"
echo ""
echo "For detailed setup instructions, see: SETUP_GUIDE.md"
echo "For deployment status, see: FINAL_STATUS_REPORT.md"
