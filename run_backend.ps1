# Script para ejecutar el backend Flask
# NASA Space Apps Challenge 2024 - Impactor

Write-Host "🚀 Iniciando Backend Flask - Impactor 2024" -ForegroundColor Green
Write-Host "NASA Space Apps Challenge 2024" -ForegroundColor Yellow
Write-Host ""

# Activar entorno virtual
Write-Host "Activando entorno virtual..." -ForegroundColor Cyan
& ".\venv\Scripts\Activate.ps1"

# Ejecutar Flask
Write-Host "Iniciando servidor Flask en http://localhost:5000" -ForegroundColor Cyan
python src/app.py