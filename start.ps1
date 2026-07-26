# start.ps1 - Script para iniciar el backend de Dinerio
Write-Host "INICIANDO DINERIO BACKEND" -ForegroundColor Cyan

# Navegar al backend relativo a la ubicacion de este script (portable entre maquinas)
Set-Location (Join-Path $PSScriptRoot "backend")

if (-not (Test-Path "package.json")) {
    Write-Host "Error: No se encuentra package.json en backend/" -ForegroundColor Red
    exit 1
}

Write-Host "Directorio correcto: $(Get-Location)" -ForegroundColor Green

if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path ".env")) {
    Write-Host "No se encontro backend/.env" -ForegroundColor Red
    Write-Host "Copia backend/.env.example a backend/.env y completa tus datos de PostgreSQL antes de continuar." -ForegroundColor Yellow
    exit 1
}

Write-Host "Iniciando servidor en http://localhost:3000..." -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow

npm run dev