# start.ps1 - Script para iniciar Dinerio
Write-Host "🚀 INICIANDO DINERIO BACKEND" -ForegroundColor Cyan

# Navegar al backend
Set-Location "C:\Users\Guille y Vane\Desktop\Dinerio1\backend"

# Verificar que estamos en el lugar correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encuentra package.json" -ForegroundColor Red
    Write-Host "💡 Verifica la ruta: C:\Users\Guille y Vane\Desktop\Dinerio1\backend" -ForegroundColor Yellow
    exit 1
}

Write-Host "Directorio correcto: $(Get-Location)" -ForegroundColor Green

# Verificar node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error instalando dependencias. Intentando con --force..." -ForegroundColor Red
        npm install --force
    }
}

# Verificar .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Creando archivo .env..." -ForegroundColor Yellow
    @"
DATABASE_URL=sqlite:./dev.db
JWT_SECRET=mi_jwt_secret_super_seguro_$(Get-Random -Minimum 100000 -Maximum 999999)
NODE_ENV=development
PORT=3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

Write-Host "🔥 Iniciando servidor en http://localhost:3000..." -ForegroundColor Green
Write-Host "⏰ Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host "=" * 50

# Iniciar servidor
npm run dev