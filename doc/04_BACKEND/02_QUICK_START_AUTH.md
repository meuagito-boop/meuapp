# 🚀 QUICK START - Auth Module

## ⏱️ 5 Minutos para Começar

### 1. Instalar Dependências (1 min)

```bash
cd backend
npm install
```

✅ Verifica se instalou:
- @nestjs/jwt
- @nestjs/passport
- passport
- passport-jwt
- passport-local
- bcryptjs
- speakeasy

### 2. Configurar .env (1 min)

Editar `backend/.env`:
```properties
JWT_SECRET="sua_chave_super_segura_aqui_change_me_123456789"
JWT_EXPIRATION="15m"
REFRESH_TOKEN_SECRET="sua_outra_chave_super_segura_change_me_987654321"
REFRESH_TOKEN_EXPIRATION="7d"
```

⚠️ **Em produção**, usar valores aleatórios e seguros!

### 3. Criar Database (2 min)

```bash
# Criar tabelas
npm run prisma:migrate -- --name init

# Adicionar dados de teste (opcional)
npm run prisma:seed
```

### 4. Iniciar Servidor (1 min)

```bash
npm run start:dev
```

✅ Verificar:
- Terminal mostra "Listening on port 3001"
- Swagger em http://localhost:3001/api/docs

---

## 🧪 Testar Endpoints (cURL)

### 1. Signup (Registrar)

```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "name": "Seu Nome",
    "password": "SecurePassword123!",
    "passwordConfirm": "SecurePassword123!",
    "profileType": "USER"
  }'
```

**Resposta esperada** (201):
```json
{
  "id": "uuid-aqui",
  "email": "usuario@example.com",
  "name": "Seu Nome",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "SecurePassword123!"
  }'
```

**Resposta esperada** (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Seu Nome"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900
}
```

💾 Guardar `accessToken` e `refreshToken`!

### 3. Usar Token (Chamada Protegida)

```bash
curl -X GET http://localhost:3001/api/me \
  -H "Authorization: Bearer {accessToken}"
```

Substitua `{accessToken}` pelo valor recebido no login.

### 4. Refresh Token (Renovar Access)

```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Authorization: Bearer {refreshToken}"
```

**Resposta**:
```json
{
  "accessToken": "novo-token",
  "refreshToken": "novo-refresh",
  "expiresIn": 900
}
```

⚠️ Usar o novo `refreshToken` para próximos refreshes!

### 5. Logout

```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer {accessToken}"
```

**Resposta** (200):
```json
{
  "message": "Logout successful"
}
```

### 6. Enable 2FA (Setup)

```bash
curl -X POST http://localhost:3001/auth/enable-2fa \
  -H "Authorization: Bearer {accessToken}"
```

**Resposta**:
```json
{
  "secret": "ABCD1234EFGH5678",
  "qrCode": "data:image/png;base64,iVBORw0K...",
  "message": "Scan QR code with authenticator app"
}
```

📱 Escanear QR code com:
- Google Authenticator
- Microsoft Authenticator
- FreeOTP
- Authy

### 7. Verify 2FA (Ativar)

```bash
curl -X POST http://localhost:3001/auth/verify-2fa \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'
```

**Resposta**:
```json
{
  "message": "2FA successfully enabled",
  "backupCodes": ["CODE1", "CODE2", ..., "CODE8"]
}
```

💾 Guardar os backup codes em local seguro!

---

## 🔍 Testar com Postman

### 1. Importar Collection

```
1. Abrir Postman
2. File → Import → Paste raw text:
```

```
{
  "info": {
    "name": "Meu Agito Auth",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Signup",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/auth/signup",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"user@test.com\",\"name\":\"Test\",\"password\":\"Pass123!\",\"passwordConfirm\":\"Pass123!\"}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"user@test.com\",\"password\":\"Pass123!\"}"
        }
      }
    }
  ]
}
```

### 2. Usar Bearer Token

```
1. Fazer login
2. Copiar accessToken da resposta
3. Criar request protegida
4. Ir em "Auth" tab
5. Selecionar "Bearer Token"
6. Colar token em "Token" field
7. Send!
```

---

## 🧪 Rodar Testes

### Todos os Testes

```bash
npm run test auth
```

### Com Coverage Report

```bash
npm run test:cov auth
```

### Watch Mode (Rerun on change)

```bash
npm run test -- --watch auth
```

**Esperado**: 16/16 tests passing ✅

---

## 📊 Swagger API Docs

Abrir navegador: **http://localhost:3001/api/docs**

✅ Todos os 11 endpoints listados
✅ Request/response examples
✅ Try it out button
✅ Autenticação com Bearer token

---

## 🔐 Fluxo Completo (Passo a Passo)

### 1️⃣ Registrar Novo Usuário

```bash
# Signup
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@example.com",
    "name": "Novo Usuário",
    "password": "SecurePass123!",
    "passwordConfirm": "SecurePass123!"
  }'

# Resultado: Recebe accessToken + refreshToken
```

### 2️⃣ Login com Credenciais

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@example.com",
    "password": "SecurePass123!"
  }'

# Resultado: Novos tokens
```

### 3️⃣ Usar Token em Chamadas

```bash
# Chamar endpoint protegido
curl -X GET http://localhost:3001/api/me \
  -H "Authorization: Bearer {accessToken}"

# Resultado: Dados do usuário
```

### 4️⃣ Token Expirou?

```bash
# Fazer refresh antes de expirar
curl -X POST http://localhost:3001/auth/refresh \
  -H "Authorization: Bearer {refreshToken}"

# Resultado: Novo accessToken
```

### 5️⃣ Fazer Logout

```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer {accessToken}"

# Resultado: Tokens invalidados
```

---

## 🔑 JWT Token Anatomy

Seu token JWT tem 3 partes:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InV1aWQtYXF1aSIsImlhdCI6MTcwNTMzNDAwMCwiZXhwIjoxNzA1MzM0OTAwfQ.asdf...

[Header].[Payload].[Signature]
```

**Decodificar** em https://jwt.io:
1. Copiar token completo
2. Colar em jwt.io
3. Ver Claims (id, iat, exp)

---

## ⏱️ Token Expiration

- **Access Token**: 15 minutos
- **Refresh Token**: 7 dias
- **Email Verification**: 24 horas
- **Password Reset**: 1 hora

---

## 🛠️ Solução de Problemas

### "Endpoint not found"
```
✅ Verificar se server está rodando (npm run start:dev)
✅ Verificar URL (com /auth/login, não /api/auth/login)
✅ Verificar método (POST, não GET)
```

### "Invalid JWT"
```
✅ Verificar se JWT_SECRET está no .env
✅ Verificar se token não expirou
✅ Verificar se usando "Bearer {token}" corretamente
```

### "Testes falhando"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Rodar migrations
npm run prisma:migrate -- --name init

# Executar testes
npm run test auth
```

### "Database error"
```bash
# Resetar banco (CUIDADO - apaga dados!)
npm run prisma:reset

# Recriar schema
npm run prisma:migrate -- --name init

# Adicionar dados de teste
npm run prisma:seed
```

---

## 📝 Próximas Tarefas

- [ ] Integrar Email Service (Amazon SES)
- [ ] Adicionar Rate Limiting
- [ ] Implementar OAuth (Google/GitHub)
- [ ] Integrar com Frontend
- [ ] Adicionar logging

---

## 📚 Referências

- **Documentação Completa**: `16_AUTH_MODULE_COMPLETO.md`
- **Status & Testes**: `17_AUTH_MODULE_STATUS.md`
- **Swagger Docs**: http://localhost:3001/api/docs
- **JWT Spec**: https://tools.ietf.org/html/rfc7519
- **2FA TOTP**: https://tools.ietf.org/html/rfc4226

---

## ✅ Checklist de Setup

- [ ] npm install
- [ ] .env configurado
- [ ] npm run prisma:migrate
- [ ] npm run start:dev
- [ ] http://localhost:3001/api/docs acessa
- [ ] npm run test auth (testes passam)
- [ ] Signup funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Refresh token funciona

**Tudo verde? Parabéns! Auth Module está funcionando! 🎉**

---

**Tempo Total**: ~5-10 minutos  
**Dificuldade**: ⭐⭐ (fácil)  
**Status**: Production Ready ✅
