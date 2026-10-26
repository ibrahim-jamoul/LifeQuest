# Windows / PowerShell

1. Installer Flutter stable 3.47+ et les outils Android selon https://docs.flutter.dev/get-started/install/windows/mobile ; vérifier `flutter doctor -v`.
2. Ouvrir PowerShell dans la racine du ZIP extrait.
3. `powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap_windows.ps1`
4. `powershell -ExecutionPolicy Bypass -File .\scripts\verifier_windows.ps1`
5. `flutter devices` puis `flutter run -d <id>`.
6. Pour une compilation Android non distribuable : `flutter build apk --debug`.

L'exécution de ces commandes se fait sur votre PC, pas lors de la production du ZIP.
Génération iOS : projets Xcode créés par Flutter ; build, signature et distribution nécessitent macOS ou une CI macOS.
