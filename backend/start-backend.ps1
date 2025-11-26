# Zwolnij port 8081 (jeśli coś na nim siedzi)
$portPid = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique

if ($portPid) {
    Write-Host "Zatrzymuję proces na porcie 8081 (PID = $portPid)..." -ForegroundColor Yellow
    try {
        Stop-Process -Id $portPid -Force -ErrorAction Stop
    } catch {
        Write-Host "Nie udało się zatrzymać procesu: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Port 8081 jest wolny." -ForegroundColor Green
}

# Przejdź do katalogu, w którym leży skrypt (backend)
Set-Location $PSScriptRoot
Write-Host "Aktualny katalog: $PWD" -ForegroundColor Cyan

# Start backendu
Write-Host "Uruchamiam backend (mvnw spring-boot:run)..." -ForegroundColor Cyan
.\mvnw.cmd spring-boot:run

Write-Host ""
Write-Host "Serwer został zatrzymany lub wystąpił błąd." -ForegroundColor Yellow
Read-Host "Naciśnij Enter, aby zamknąć to okno"
