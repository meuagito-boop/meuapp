# Socket.IO Integration Guide

## Overview

Socket.IO foi totalmente integrado no seu projeto para comunicação real-time. Está configurado para gerenciar:
- ✅ Mensagens em tempo real
- ✅ Indicadores de digitação
- ✅ Read receipts (mensagens lidas)
- ✅ Status online/offline
- ✅ Gerenciamento de conexão automático

## Arquitetura

```
Socket.IO Client (socket.io-client v4.7.2)
        ↓
SocketIOManager (Singleton Service)
        ↓
useSocket Hook (React Abstraction)
        ↓
React Components (ChatDetailScreen, etc)
```

## Como Usar em Componentes

### 1. Importar o Hook

```typescript
import { useSocket } from '@hooks';
```

### 2. Usar o Hook

```typescript
function ChatDetailScreen() {
  const { 
    sendMessage,           // Enviar mensagem
    setTyping,            // Enviar status de digitação
    markAsRead,           // Marcar como lido
    editMessage,          // Editar mensagem
    deleteMessage,        // Deletar mensagem
    joinConversation,     // Entrar em conversa
    leaveConversation,    // Sair de conversa
    on,                   // Escutar eventos
    off,                  // Parar de escutar
    isConnected,          // Status da conexão
    socketId,             // ID do socket
    manager               // Acesso direto ao SocketIOManager (avançado)
  } = useSocket();

  // Seu código aqui...
}
```

## Exemplos de Uso

### Exemplo 1: Enviar Mensagem

```typescript
const handleSendMessage = async () => {
  try {
    await sendMessage(conversationId, 'Olá mundo!');
    console.log('Mensagem enviada com sucesso');
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
};
```

### Exemplo 2: Escutar Mensagens Recebidas

```typescript
useEffect(() => {
  const unsubscribe = on('message:received', (message) => {
    console.log('Nova mensagem:', message);
    setMessages(prev => [...prev, message]);
    
    // Scroll para última mensagem
    flatListRef.current?.scrollToEnd({ animated: true });
  });

  // Cleanup automático
  return unsubscribe;
}, [on]);
```

### Exemplo 3: Indicador de Digitação

```typescript
const handleInputChange = (text) => {
  setText(text);
  
  // Enviar que está digitando
  setTyping(conversationId, true);
  
  // Parar de digitar após 2 segundos de inatividade
  clearTimeout(typingTimeoutRef.current);
  typingTimeoutRef.current = setTimeout(() => {
    setTyping(conversationId, false);
  }, 2000);
};

// Escutar quando outros estão digitando
useEffect(() => {
  const unsubscribe = on('typing:user', (data) => {
    if (data.userId !== currentUserId) {
      setOtherUserTyping(data.isTyping);
    }
  });
  
  return unsubscribe;
}, [on]);
```

### Exemplo 4: Read Receipts

```typescript
// Marcar mensagens como lidas
useEffect(() => {
  const unreadMessages = messages.filter(
    msg => !msg.readBy.includes(currentUserId)
  );
  
  if (unreadMessages.length > 0) {
    // Marcar localmente
    setMessages(prev =>
      prev.map(msg =>
        !msg.readBy.includes(currentUserId)
          ? { ...msg, readBy: [...msg.readBy, currentUserId] }
          : msg
      )
    );
    
    // Notificar outros usuários
    unreadMessages.forEach(msg => {
      markAsRead(msg.id, conversationId);
    });
  }
}, [conversationId, markAsRead]);
```

### Exemplo 5: Room Management (Join/Leave)

```typescript
useEffect(() => {
  // Entrar na conversa
  joinConversation(conversationId);
  
  // Sair ao desmontar
  return () => {
    leaveConversation(conversationId);
  };
}, [conversationId, joinConversation, leaveConversation]);
```

### Exemplo 6: Verificar Status da Conexão

```typescript
function ChatScreen() {
  const { isConnected } = useSocket();
  
  return (
    <View>
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text>⚠️ Desconectado - Messages serão sincronizadas</Text>
        </View>
      )}
      {/* Rest of UI */}
    </View>
  );
}
```

## Eventos Socket.IO Suportados

### Client → Server

| Evento | Parâmetros | Descrição |
|--------|-----------|-----------|
| `message:send` | `{ conversationId, content, fileUrl? }` | Enviar mensagem |
| `typing:start` | `{ conversationId }` | Começar a digitar |
| `typing:stop` | `{ conversationId }` | Parar de digitar |
| `message:read` | `{ messageId, conversationId }` | Marcar como lido |
| `message:edit` | `{ messageId, content }` | Editar mensagem |
| `message:delete` | `{ messageId }` | Deletar mensagem |
| `conversation:join` | `{ conversationId }` | Entrar em conversa |
| `conversation:leave` | `{ conversationId }` | Sair de conversa |

### Server → Client

| Evento | Dados | Descrição |
|--------|-------|-----------|
| `message:received` | `{ id, content, senderId, senderName, timestamp }` | Mensagem recebida |
| `typing:user` | `{ userId, isTyping }` | Outro usuário digitando |
| `message:read` | `{ messageId, userId }` | Mensagem foi lida |
| `user:online` | `{ userId, isOnline }` | Status online/offline |

## Fluxo de Conexão Automático

1. **Login**: Usuário faz login → `authStore.login()` chama `SocketIOManager.connect()`
2. **Conectado**: Socket.IO conecta com JWT token automático
3. **Pronto**: useSocket hook disponível em qualquer componente
4. **Logout**: Usuário faz logout → `SocketIOManager.disconnect()` chamado

### Erro de Conexão

Se algo der errado na conexão:
- ❌ Socket.IO falha → Não bloqueia auth flow (non-blocking)
- 🔄 Reconecta automaticamente com exponential backoff
- 📱 App continua funcionando com dados mock locais

## Implementação Atual

### ✅ Já Integrado

- [x] SocketIOManager singleton (backend connection)
- [x] useSocket hook (React abstraction)
- [x] authStore integration (login/logout)
- [x] ChatDetailScreen listeners (messages, typing)
- [x] Message sending via Socket.IO
- [x] Typing indicators
- [x] Read receipts base

### ⏳ Próximos Passos (Opcional)

- [ ] ConversationsListScreen Socket.IO sync
- [ ] Notificações push em background
- [ ] Voice/Video calls via WebRTC
- [ ] File uploads via Socket.IO
- [ ] Offline message queue

## Debugging

### Ver Logs do Socket.IO

```typescript
// No SocketIOManager.ts (já está configurado):
socket?.onConnect(() => console.log('Socket conectado'));
socket?.onDisconnect(() => console.log('Socket desconectado'));
socket?.on('error', (error) => console.error('Erro Socket:', error));
```

### Checker de Conexão

```typescript
import { useSocket } from '@hooks';

function ConnectionDebugger() {
  const { isConnected, socketId } = useSocket();
  
  return (
    <Text>
      {isConnected ? '✅ Conectado' : '❌ Desconectado'}
      {socketId && ` - ID: ${socketId}`}
    </Text>
  );
}
```

### Testar com Backend Local

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm start

# Abrir DevTools → Network → WS
# Deve ver conexão WebSocket em: ws://localhost:3001/socket.io/?...
```

## Troubleshooting

### Socket.IO não conecta

1. ✅ Backend está rodando? `npm run start:dev` no backend
2. ✅ URL correta? Verificar `EXPO_PUBLIC_API_URL` no `.env`
3. ✅ CORS habilitado? Backend tem `socket.io` configurado
4. ✅ Token JWT válido? `authStore` tem token pós-login

### Mensagens não aparecem

1. Base: Verificar que Socket.IO está conectado (`isConnected === true`)
2. Evento escutado? Tem `on('message:received', ...)` ativo?
3. Conversa correta? Verificar `conversationId` matches
4. Server emite? Backend está emitindo `message:received`?

### Memory Leak

- ✅ useSocket hook faz cleanup automático
- ✅ `on()` retorna unsubscribe function
- ✅ Chamadas em useEffect retornam cleanup

## Recursos Adicionais

- **Socket.IO Docs**: https://socket.io/docs/v4/client-api/
- **React Hooks Pattern**: Veja `frontend/src/hooks/useSocket.ts`
- **Exemplos Backend**: Veja `backend/src/gateway/chat.gateway.ts`

## Próxima Etapa

Para testar Socket.IO em funcionamento:

1. Assegurar backend rodando
2. Fazer login no app (ativa Socket.IO)
3. Abrir chat e enviar mensagem
4. Ele deve aparecer em tempo real
5. Ver "X está digitando" do outro lado

---

**Status**: ✅ Socket.IO totalmente integrado e pronto para uso
**Último Update**: Hoje
**Suporte**: Veja TypeScript types em `useSocket.ts` para referência completa
