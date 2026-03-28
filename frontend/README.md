# Meu Agito - Mobile Frontend

Frontend mobile da aplicação Meu Agito, desenvolvido com React Native e Expo.

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI: `npm install -g expo-cli`
- iOS (opcional): Xcode + iOS Simulator
- Android (opcional): Android Studio + Android Emulator

## 🚀 Começar Rápido

```bash
# Instalar dependências
npm install

# Iniciar servidor Expo
npm start

# Abrir no iOS Simulator
npm run ios

# Abrir no Android Emulator
npm run android

# Abrir na web
npm run web
```

## 📱 Estrutura do Projeto

```
src/
├── screens/          # Telas (Auth, Main)
│   ├── auth/        # Login, SignUp, ProfileSelection
│   ├── main/        # Home, Search, Map, Chat, Profile
│   └── navigation/  # RootNavigator
├── store/           # Zustand stores
│   ├── useAuthStore.ts
│   └── useLocationStore.ts
├── services/        # APIs & Services
│   ├── apiClient.ts
│   ├── geolocationService.ts
│   └── [outros]
├── components/      # Componentes reutilizáveis
├── hooks/          # Custom hooks
├── utils/          # Funções utilitárias
├── constants/      # Constantes
├── types/          # TypeScript types
├── theme/          # Cores, tipografia, etc
└── App.tsx         # Entry point
```

## 🔑 Variáveis de Ambiente

Criar arquivo `.env` (na raiz do frontend):

```
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_APP_NAME=Meu Agito
```

## 📱 Features Principais

- ✅ Autenticação JWT
- ✅ Geolocalização automática (Expo Location)
- ✅ Navigation com React Navigation
- ✅ State Management com Zustand
- ✅ API Client com axios + interceptors
- ✅ Testes com Jest

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com cobertura
npm run test:cov

# Modo watch
npm run test:watch
```

## 🛠️ Desenvolvimento

### Adicionar novo screen

```typescript
// src/screens/[category]/MyScreen.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function MyScreen() {
  return (
    <View style={styles.container}>
      <Text>Meu novo screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
```

### Adicionar novo store (Zustand)

```typescript
// src/store/useMyStore.ts
import { create } from 'zustand';

interface MyState {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

## 🔗 Dependências Principais

| Pacote | Versão | Propósito |
|--------|--------|----------|
| react-native | 0.73 | Framework mobile |
| expo | 50 | Toolchain |
| @react-navigation | 6.x | Navigation |
| zustand | 4.x | State management |
| axios | 1.x | HTTP client |
| @tanstack/react-query | 5.x | Data fetching |
| expo-location | 16.x | GPS |
| react-native-maps | 1.x | Mapas |

## 🐛 Debugging

```bash
# Ver logs em tempo real
npm start

# Modo profundidade
expo start --clear
```

## 📚 Documentação Útil

- [Expo Documentation](https://docs.expo.dev)
- [React Native](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)
- [Zustand](https://github.com/pmndrs/zustand)

## 📝 Licença

MIT
