# Meu Agito — AWS Cost Control Plan

## Objetivo

Definir as proteções mínimas de custo antes da criação de qualquer infraestrutura AWS.

Este arquivo não cria recursos.  
Ele documenta as regras de controle financeiro da conta AWS do projeto Meu Agito.

---

## Conta AWS

Account ID: 139023234711  
Region principal: sa-east-1  
Profile AWS CLI: meuagito-admin  

---

## Orçamentos já configurados

### 1. MeuAgito-Zero-Spend

Objetivo:

- alertar quando houver qualquer gasto acima de US$ 0,01;
- detectar cobranças inesperadas;
- proteger a conta durante a fase inicial.

Status esperado:

- criado no AWS Budgets;
- notificação por e-mail configurada.

---

### 2. MeuAgito-Monthly-Limit

Objetivo:

- limitar acompanhamento mensal de custo;
- alertar quando o uso real ou previsto se aproximar do limite definido.

Valor inicial:

- US$ 20,00 por mês.

Status esperado:

- criado no AWS Budgets;
- notificação por e-mail configurada;
- alertas em 85%, 100% real e 100% previsto.

---

## Regras obrigatórias

- Não criar infraestrutura sem revisar impacto de custo.
- Não criar NAT Gateway sem justificativa.
- Não criar RDS Multi-AZ no início sem decisão explícita.
- Não criar instâncias grandes sem necessidade real.
- Não deixar Load Balancer, ECS, RDS ou ElastiCache rodando por teste sem controle.
- Não criar recursos fora de sa-east-1 sem justificativa.
- Não criar serviços duplicados.
- Não usar root para operações diárias.
- Não ignorar alertas de billing.

---

## Pontos de maior atenção de custo

### 1. NAT Gateway

Pode gerar custo recorrente.  
Deve ser evitado no início se a arquitetura permitir.

### 2. RDS

Custo recorrente enquanto estiver ativo.  
Deve ser dimensionado com cuidado.

### 3. ElastiCache

Custo recorrente enquanto estiver ativo.  
Deve ser criado somente quando for realmente usado pela aplicação.

### 4. Application Load Balancer

Custo recorrente enquanto estiver ativo.  
Necessário para HTTPS e tráfego profissional do backend, mas deve ser considerado no orçamento.

### 5. CloudFront

Custo depende de tráfego.  
Deve ser usado com política de cache adequada.

### 6. S3

Custo depende de armazenamento, requisições e transferência.  
Deve ter lifecycle policy quando aplicável.

### 7. CloudWatch

Logs em excesso podem gerar custo.  
Deve haver retenção definida.

---

## Política inicial de custo

Antes do primeiro deploy real, a infraestrutura deve ser planejada para:

- menor quantidade possível de recursos permanentes;
- uso profissional, mas sem desperdício;
- possibilidade de desligamento controlado quando necessário;
- logs com retenção definida;
- banco e cache privados;
- storage separado do banco;
- CDN apenas quando o fluxo de mídia estiver pronto.

---

## Checklist antes de criar infraestrutura

- [ ] Budgets criados.
- [ ] MFA root ativo.
- [ ] IAM Identity Center ativo.
- [ ] Usuário administrativo criado.
- [ ] AWS CLI configurada com profile meuagito-admin.
- [ ] Região confirmada como sa-east-1.
- [ ] Arquitetura alvo documentada.
- [ ] Custo dos serviços revisado.
- [ ] Plano de rede documentado.
- [ ] Plano de segurança documentado.

---

## Decisão atual

A conta AWS está preparada para planejamento.

A criação de recursos AWS ainda deve aguardar:

1. plano de rede;
2. plano de segurança;
3. plano de banco;
4. plano de storage;
5. plano de deploy backend;
6. revisão final de custo.
