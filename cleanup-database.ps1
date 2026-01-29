# NeonConnect Database Cleanup Script (PowerShell)

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  DATABASE CLEANUP INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "TO CLEAN UP THE DATABASE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://supabase.com/dashboard/project/vkxkzgjdluusviccnsdw" -ForegroundColor White
Write-Host ""
Write-Host "2. Click: SQL Editor (left sidebar)" -ForegroundColor White
Write-Host ""
Write-Host "3. Open file: database/cleanup-database.sql" -ForegroundColor White
Write-Host ""
Write-Host "4. Copy ALL the SQL code" -ForegroundColor White
Write-Host ""
Write-Host "5. Paste into Supabase SQL Editor" -ForegroundColor White
Write-Host ""
Write-Host "6. Click: RUN" -ForegroundColor Cyan
Write-Host ""
Write-Host "WHAT IT WILL DO:" -ForegroundColor Green
Write-Host "  - Delete all chat messages" -ForegroundColor Gray
Write-Host "  - Delete all applications" -ForegroundColor Gray
Write-Host "  - Delete all saved jobs" -ForegroundColor Gray
Write-Host "  - Delete all draft jobs" -ForegroundColor Gray
Write-Host "  - Delete all profiles" -ForegroundColor Gray
Write-Host "  - Delete test users from last 30 days" -ForegroundColor Gray
Write-Host "  - Optimize database (VACUUM ANALYZE)" -ForegroundColor Gray
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
