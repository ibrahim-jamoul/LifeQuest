#requires -Version 5.1
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
flutter doctor -v
flutter pub get
if ($LASTEXITCODE -ne 0) { throw 'Dependencies KO' }
dart format lib test integration_test
if ($LASTEXITCODE -ne 0) { throw 'Dart format KO' }
flutter analyze
if ($LASTEXITCODE -ne 0) { throw 'Analyse statique KO' }
flutter test
if ($LASTEXITCODE -ne 0) { throw 'Tests KO' }
Write-Host 'Analyse + tests termines avec succes.'
Write-Host 'Pour lancer : flutter run -d <id_appareil>'
Write-Host 'Pour compiler : flutter build apk --debug'
