# Script para ejecutar el frontend React
# NASA Space Apps Challenge 2024 - Impactor

Write-Host "⚛️ Iniciando Frontend React - Impactor 2024" -ForegroundColor Blue
Write-Host "NASA Space Apps Challenge 2024" -ForegroundColor Yellow
Write-Host ""

# Cambiar al directorio del frontend
Set-Location -Path ".\frontend"

# Ejecutar Vite dev server
Write-Host "Iniciando servidor de desarrollo en http://localhost:5173" -ForegroundColor Cyan
npm run dev