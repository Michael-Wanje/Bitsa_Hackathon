# BITSA Website Setup Script
# This script sets up the development environment for the BITSA website

Write-Host "🚀 Setting up BITSA Website Development Environment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if pnpm is installed
Write-Host "📦 Checking for pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm is installed (version: $pnpmVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ pnpm not found. Installing pnpm..." -ForegroundColor Red
    npm install -g pnpm
}

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
pnpm install

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
pnpm install
Set-Location ..

# Check for PostgreSQL
Write-Host "🗄️  Checking for PostgreSQL..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version
    Write-Host "✅ PostgreSQL is installed: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL not found." -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "Or use Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres" -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor White
Write-Host "🎉 Setup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Set up your PostgreSQL database" -ForegroundColor White
Write-Host "2. Update the .env.local and backend/.env files with your database credentials" -ForegroundColor White
Write-Host "3. Run 'pnpm run db:setup' to initialize the database" -ForegroundColor White
Write-Host "4. Use 'pnpm run dev:all' to start both frontend and backend" -ForegroundColor White