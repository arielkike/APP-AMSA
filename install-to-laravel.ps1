# ==============================================================================
# SCRIPT DE INSTALACIÓN AUTOMÁTICA DE ENDPOINTS Y MÓDULO ADMINISTRATIVO
# San Miguel Móvil - AMSAsystem
# ==============================================================================

param (
    [string]$LaravelPath = ""
)

if (-not $LaravelPath) {
    Write-Host "Por favor ingresa la ruta completa a la carpeta de tu proyecto Laravel." -ForegroundColor Yellow
    Write-Host "Ejemplo: C:\xampp\htdocs\Proyecto-San-Miguel o C:\laragon\www\AMSAsystem" -ForegroundColor Gray
    $LaravelPath = Read-Host "Ruta de Laravel"
}

if (-not (Test-Path $LaravelPath)) {
    Write-Host "❌ Error: La ruta '$LaravelPath' no existe." -ForegroundColor Red
    exit 1
}

$artisan = Join-Path $LaravelPath "artisan"
if (-not (Test-Path $artisan)) {
    Write-Host "⚠️ Advertencia: No se encontró el archivo 'artisan'. Asegúrate de que sea la raíz de Laravel." -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Copiando controladores API y Panel de Administración a Laravel..." -ForegroundColor Cyan

# 1. Copiar Controladores API
$targetApiControllers = Join-Path $LaravelPath "app\Http\Controllers\Api"
if (-not (Test-Path $targetApiControllers)) { New-Item -ItemType Directory -Path $targetApiControllers -Force | Out-Null }
Copy-Item (Join-Path $PSScriptRoot "backend-laravel-files\app\Http\Controllers\Api\*") $targetApiControllers -Recurse -Force
Write-Host "✅ Controladores API copiados." -ForegroundColor Green

# 2. Copiar Controlador Administrativo Web
$targetAdminControllers = Join-Path $LaravelPath "app\Http\Controllers\Admin"
if (-not (Test-Path $targetAdminControllers)) { New-Item -ItemType Directory -Path $targetAdminControllers -Force | Out-Null }
Copy-Item (Join-Path $PSScriptRoot "backend-laravel-files\app\Http\Controllers\Admin\*") $targetAdminControllers -Recurse -Force
Write-Host "✅ Controlador de Administración Web copiado." -ForegroundColor Green

# 3. Copiar Vistas Blade Administrativas
$targetViews = Join-Path $LaravelPath "resources\views\admin\lotificaciones"
if (-not (Test-Path $targetViews)) { New-Item -ItemType Directory -Path $targetViews -Force | Out-Null }
Copy-Item (Join-Path $PSScriptRoot "backend-laravel-files\resources\views\admin\lotificaciones\*") $targetViews -Recurse -Force
Write-Host "✅ Vistas Blade de Administración copiadas." -ForegroundColor Green

# 4. Anexar Rutas API
$targetApiRoutes = Join-Path $LaravelPath "routes\api.php"
$sourceApiRoutes = Get-Content (Join-Path $PSScriptRoot "backend-laravel-files\routes\api.php") -Raw
if (Test-Path $targetApiRoutes) {
    $existing = Get-Content $targetApiRoutes -Raw
    if ($existing -notmatch "PublicShowroomController") {
        Add-Content -Path $targetApiRoutes -Value "`n`n// === San Miguel Móvil API Routes ===`n$sourceApiRoutes"
        Write-Host "✅ Rutas API agregadas a: $targetApiRoutes" -ForegroundColor Green
    }
} else {
    Set-Content -Path $targetApiRoutes -Value $sourceApiRoutes
}

# 5. Anexar Rutas Web Administrativas
$targetWebRoutes = Join-Path $LaravelPath "routes\web.php"
$sourceWebRoutes = Get-Content (Join-Path $PSScriptRoot "backend-laravel-files\routes\web.php") -Raw
if (Test-Path $targetWebRoutes) {
    $existingWeb = Get-Content $targetWebRoutes -Raw
    if ($existingWeb -notmatch "AdminLotificacionController") {
        Add-Content -Path $targetWebRoutes -Value "`n`n// === Panel Admin Lotificaciones (Fotos y Contenido App) ===`n$sourceWebRoutes"
        Write-Host "✅ Rutas Web Administrativas agregadas a: $targetWebRoutes" -ForegroundColor Green
    }
}

Write-Host "`n🎉 ¡Instalación completada con éxito!" -ForegroundColor Green
Write-Host "• API Móvil activa en: /api/v1/..." -ForegroundColor Cyan
Write-Host "• Panel Web de Fotos y Proyectos en: /admin/lotificaciones" -ForegroundColor Cyan
