# PROJECT_CONTEXT.md

## Projeto
Meu Agito

## Visão do produto
Meu Agito é um aplicativo mobile focado em descoberta local, interação social e experiência contextual para usuários de Guarulhos.

O produto combina elementos de:
- descoberta de lugares
- eventos
- feed social
- perfis
- interações em tempo real
- localização

## Objetivo do MVP
Lançar um MVP funcional, coeso e enxuto, com foco em experiência confiável e velocidade de iteração.

O MVP deve evitar escopo excessivo. O objetivo não é cobrir tudo, e sim entregar o núcleo de valor com qualidade suficiente para uso real.

## Público inicial
Usuários jovens e adultos, ativos socialmente, interessados em descobrir lugares, eventos e interações locais em Guarulhos.

## Princípios de produto
- mobile-first
- simples de entender
- rápido de usar
- visualmente consistente
- social sem ser confuso
- baseado em contexto local
- fácil de evoluir

## Stack principal
### Mobile
- React Native
- TypeScript
- Expo

### Backend
- NestJS
- Prisma
- PostgreSQL
- Redis

## Diretrizes técnicas
- TypeScript estrito
- componentização clara
- foco em manutenibilidade
- tratamento explícito de erro
- validação de inputs
- autenticação e autorização bem definidas
- evitar acoplamento desnecessário

## Diretrizes de UX/UI
- tema dark como padrão
- cor primária: #E8640A
- background principal: #0D0D0D
- interfaces com boa hierarquia visual
- estados vazios, loading e erro devem ser desenhados e implementados
- acessibilidade básica é obrigatória
- áreas tocáveis adequadas em mobile

## Diretrizes de segurança
- tokens e segredos nunca em armazenamento inseguro
- dados sensíveis precisam de tratamento explícito
- localização é dado sensível do ponto de vista de privacidade
- integrações externas precisam ser validadas
- sem exposição desnecessária de dados de usuário

## Critérios de qualidade
Toda feature idealmente deve:
- atender ao objetivo funcional
- ter comportamento previsível
- lidar com falha de rede
- respeitar padrões do projeto
- ser revisável por outro desenvolvedor
- não introduzir risco óbvio de segurança

## Filosofia de implementação
- entregar pequeno e bem feito
- evitar abstrações prematuras
- preferir clareza a “esperteza”
- ser explícito em hipóteses
- não inventar complexidade onde não precisa

## Observação
Se o código real do repositório divergir deste contexto, o código real prevalece, mas o agente deve manter estas diretrizes como padrão de decisão.

