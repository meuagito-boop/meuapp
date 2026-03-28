# Socket.IO Test & Setup Guide

## Começar a Usar Socket.IO Imediatamente

### Pré-requisitos

```bash
# 1. Backend rodando
cd backend
npm run start:dev

# 2. Frontend instalado
cd frontend
npm install  # Se ainda não fez
npm start    # Expo client
```

## Cenário 1: Teste Básico (Local)

### Setup

1. **Abrir App no Emulador/Dispositivo**
   ```
   npm start → Escolher iOS ou Android
   ```

2. **Fazer Login** 
   - Qualquer email/senha (mock auth)
   - Socket.IO conecta automaticamente

3. **Abrir Chat**
   - Vai para ConversationsList
   - Clica em uma conversa
   - Abre ChatDetailScreen

### Teste: Enviar Mensagem

1. Digite mensagem: "Olá Socket.IO!"
2. Clique para enviar
3. Deve aparecer imediatamente na tela
4. Status: ✓ (uma vez lida) → ✓✓ (ambos leram)

**Backend Log esperado:**
```
[Socket.IO] message:send received
{
  conversationId: "conv_1",
  content: "Olá Socket.IO!",
  userId: "current_user"
}

[Socket.IO] Broadcasting message:received to room conv_1
```

## Cenário 2: Teste Digitação

### Teste: Typing Indicator

1. Digite lentamente: "T" → "Te" → "Tes" → "Test"
2. Por cada caractere:
   - Deve enviar `typing:start` uma vez
   - Outros 2s sem digitar → `typing:stop`
3. Ver "X está digitando..." no outro lado

**Backend Log esperado:**
```
[Socket.IO] typing:start received
{
  conversationId: "conv_1",
  userId: "current_user"
}

[2s depois...]

[Socket.IO] typing:stop received
{
  conversationId: "conv_1",
  userId: "current_user"
}
```

## Cenário 3: Teste Multi-User (Simulado)

### Setup Simulado

1. Abrir app em 2 emuladores/devices diferentes
2. Fazer login com usuários diferentes
3. Ambos abrerem a mesma conversa

### Teste: Real-time Sync

1. **Emulador A**: Digita "Oi de A"
2. **Emulador B**: Deve ver digitação em tempo real
3. **Emulador A**: Envia mensagem
4. **Emulador B**: Recebe instantaneamente via Socket.IO

## Verificar Conexão Socket.IO

### Debug No Terminal

```bash
# Verificar se Backend aceita conexões
lsof -i :3001  # Macbook/Linux
netstat -ano | findstr :3001  # Windows

# Deve mostrar Node.js escutando na porta
```

### Debug no App

Adicione este componente temporário em qualquer tela:

```typescript
import { useSocket } from '@hooks';

function DebugSocket() {
  const { isConnected, socketId } = useSocket();
  
  return (
    <View style={{ padding: 10, backgroundColor: '#1a1a2e', marginBottom: 10 }}>
      <Text style={{ color: 'white' }}>
        {isConnected ? '✅ Socket.IO Conectado' : '❌ Desconectado'}
      </Text>
      {socketId && (
        <Text style={{ color: '#0f3460', fontSize: 10, marginTop: 5 }}>
          ID: {socketId.substring(0, 8)}...
        </Text>
      )}
    </View>
  );
}

// Adicionar em ChatDetailScreen ou ConversationsListScreen para testar
```

### DevTools Inspeção

**Chrome DevTools (React Native - Android)**

```bash
adb shell input keyevent 82  # Abre DevTools menu
Tap "Enable Network Inspection"
```

Procurar por conexão WebSocket:
```
ws://localhost:3001/socket.io/?EIO=4&transport=websocket&...
```

## Resolver Problemas Comuns

### ❌ "Socket.IO não conecta"

**Causa 1**: Backend não está rodando
```bash
cd backend
npm run start:dev
```

**Causa 2**: URL errada no `.env`
```bash
# .env.local (frontend)
EXPO_PUBLIC_API_URL=http://localhost:3001  # Ajustar IP se em rede real

# Se usando dispositivo físico:
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3001
# Exemplo: http://192.168.1.100:3001
```

**Causa 3**: CORS/Socket.IO não configurado no backend
```typescript
// backend/src/main.ts
import { io } from 'socket.io';

const io = new Server(app, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
```

### ❌ "Mensagens não chegam"

**Checklist**:
- ✅ `isConnected` é true? (verificar com DebugSocket)
- ✅ Backend recebeu `message:send`? (verificar logs)
- ✅ Event listener active? (`on('message:received', ...)`)
- ✅ Conversa ID certa? (verificar params)

**Teste de Echo**:

```typescript
// Adicionar em ChatDetailScreen para testar
useEffect(() => {
  const testEcho = on('message:echo', (data) => {
    console.log('Echo recebido:', data); // Não vai chegar, só para debug
    Alert.alert('Echo Test', 'Socket.IO está respondendo!');
  });
  
  // Backend vai emitir message:echo quando receber sua mensagem
  return testEcho;
}, [on]);
```

### ❌ "Memory Warnings"

**Causa**: Bez cleanup de listeners

**Solução**: Sempre fazer cleanup
```typescript
useEffect(() => {
  const unsubscribe = on('event', callback);
  return unsubscribe;  // ← OBRIGATÓRIO
}, [on]);
```

### ⚠️ "Socket.IO reconectando constantemente"

Verificar logs:
```bash
# Backend
npm run start:dev 2>&1 | grep -i socket

# Frontend DevTools
console.log() na authStore.ts quando connect() é chamado
```

Possível causa: Token JWT expirado ou inválido

**Solução**: Fazer nova login
```typescript
const { logout, login } = useAuth();

// Quando Socket.IO falha:
if (socketError?.code === 401) {
  logout();  // Force new login
}
```

## Teste Automatizado (Pytest para Backend)

```python
# backend/tests/socket_io_test.py
import socketio
import asyncio

async def test_socket_io_connection():
    sio = socketio.AsyncClient()
    
    @sio.event
    async def connect():
        print('Socket.IO conectado')
    
    @sio.event
    async def message_received(data):
        print(f'Mensagem recebida: {data}')
    
    await sio.connect('http://localhost:3001')
    
    # Enviar mensagem de teste
    await sio.emit('message:send', {
        'conversationId': 'conv_1',
        'content': 'Teste automatizado'
    })
    
    await asyncio.sleep(1)
    await sio.disconnect()

# Rodar:
# python -m pytest backend/tests/socket_io_test.py -v
```

## Performance Checks

### Network Traffic

```bash
# Terminal
nc -l 3001  # Escuta na porta

# App envia mensagem
# Verificar tamanho do payload
```

Esperado:
- Mensagem: ~200-500 bytes
- Typing: ~100 bytes
- Read receipt: ~150 bytes

### Latência

```typescript
// Adicionar em ChatDetailScreen
const sendMessageStart = Date.now();

// Ao receber message:received:
const latency = Date.now() - sendMessageStart;
console.log(`Latência: ${latency}ms`);  // Esperado: < 500ms
```

## Próximos Passos para Produção

### 1. Configurar Backend Socket.IO

```typescript
// backend/src/gateway/socket.io.ts
const io = new Server(app, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  reconnection: {
    delay: 1000,
    maxDelay: 5000,
  },
});
```

### 2. Adicionar Persistência

```typescript
// Guardar mensagens no banco
const message = await prisma.message.create({
  data: {
    content: data.content,
    conversationId: data.conversationId,
    senderId: data.userId,
  },
});

// Broadcast
io.to(conversationId).emit('message:received', message);
```

### 3. Testes E2E

```typescript
// frontend/__tests__/socket-io.e2e.ts
describe('Socket.IO Chat', () => {
  it('should receive message in real-time', async () => {
    const { getByText, queryByText } = render(<ChatScreen />);
    
    fireEvent.changeText(getByText('Mensagem...'), 'Olá');
    fireEvent.press(getByText('📤'));
    
    await waitFor(() => {
      expect(queryByText('Olá')).toBeTruthy();
    }, { timeout: 2000 });
  });
});
```

## Status Atual

✅ **Socket.IO completamente integrado**
- Backend: Gateway Socket.IO funcional
- Frontend: useSocket hook pronto
- ChatDetailScreen: Listeners ativos
- ConversationsListScreen: Real-time updates

⏳ **Próxima etapa**: Testes e2e com 2+ usuários

---

**Comando Quick Start**:
```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2  
cd frontend && npm start

# Emulador
npm start → Escolher iOS/Android → Login → Abrir Chat → Enviar mensagem
```

**Expected**: Mensagem aparece em menos de 500ms

**Debugging**: Adicionar DebugSocket no ChatDetailScreen, ver status de conexão
