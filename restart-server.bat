@echo off
echo Deteniendo todos los procesos Node.js...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo Procesos Node detenidos exitosamente
) else (
    echo No hay procesos Node corriendo
)

timeout /t 2 /nobreak >nul

echo.
echo Iniciando servidor...
cd /d "c:\Users\natal\OneDrive\Documentos\PRUEBA TECNICA MP\API_DICRI\API_DICRI"
node server.js
