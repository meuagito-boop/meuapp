@echo off
REM Script para fazer push para GitHub com token de autenticação

REM ========================================
REM INSTRUÇÕES:
REM 1. Acesse https://github.com/settings/tokens
REM 2. Crie um Personal Access Token com escopo 'repo' completo
REM 3. Copie o token
REM 4. Execute este script e cole o token quando solicitado
REM 5. O código será feito push para seu repositório
REM ========================================

setlocal
cd /d C:\Users\Bruno\Desktop\meu-agito

echo.
echo ====================================
echo GitHub Push Script
echo ====================================
echo.

REM Solicitar token
set /p GITHUB_TOKEN="Cole seu GitHub Personal Access Token: "

REM Configurar credenciais temporárias
"C:\Program Files\Git\bin\git.exe" config --global credential.helper store

REM Criar arquivo credentials temporário
echo https://%GITHUB_TOKEN%:x-oauth-basic@github.com > "%userprofile%\.git-credentials"

REM Fazer push
echo.
echo 📤 Fazendo push para GitHub...
"C:\Program Files\Git\bin\git.exe" push origin master

if errorlevel 1 (
    echo.
    echo ❌ Erro no push. Verifique:
    echo   - Token está correto
    echo   - Repositório existe em https://github.com/meuagito-boop/meuapp
    echo   - Você tem permissão para escrever no repositório
) else (
    echo.
    echo ✅ Push realizado com sucesso!
    echo.
    echo Seu código está em: https://github.com/meuagito-boop/meuapp
)

REM Limpar credencial temporária
del "%userprofile%\.git-credentials" /q 2>nul

endlocal
pause
