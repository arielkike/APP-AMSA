# ==============================================================================
# SCRIPT PARA GENERAR LA LLAVE DE FIRMA ANDROID (KEYSTORE) DE PRODUCCIÓN
# San Miguel Móvil
# ==============================================================================

$keystorePath = "android\app\sanmiguel-release-key.jks"
$alias = "sanmiguel"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  GENERADOR DE KEYSTORE DE PRODUCCIÓN ANDROID" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

if (Test-Path $keystorePath) {
    Write-Host "`n⚠️ Ya existe un archivo Keystore en: $keystorePath" -ForegroundColor Yellow
    Write-Host "Si generas uno nuevo, sobreescribirás la clave existente." -ForegroundColor Red
    $confirm = Read-Host "¿Deseas sobreescribirlo? (S/N)"
    if ($confirm -ne 'S' -and $confirm -ne 's') {
        Write-Host "Operación cancelada." -ForegroundColor Gray
        exit 0
    }
}

Write-Host "`nEjecutando keytool..." -ForegroundColor Green
Write-Host "Te solicitará una contraseña para el keystore (Recuérdala o anótala bien)." -ForegroundColor Gray

keytool -genkey -v -keystore $keystorePath -alias $alias -keyalg RSA -keysize 2048 -validity 10000

if (Test-Path $keystorePath) {
    Write-Host "`n🎉 ¡Keystore generado con éxito en: $keystorePath!" -ForegroundColor Green
    Write-Host "• Alias: $alias" -ForegroundColor Cyan
    Write-Host "• Validez: 10,000 días" -ForegroundColor Cyan
    Write-Host "Guarda una copia de seguridad de este archivo en un lugar seguro." -ForegroundColor Yellow
} else {
    Write-Host "`n❌ No se pudo generar el keystore. Asegúrate de tener Java/JDK instalado en tu sistema." -ForegroundColor Red
}
