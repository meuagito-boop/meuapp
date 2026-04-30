# Meu Agito — AWS Network Plan

## Objetivo

Definir o desenho de rede AWS para hospedar o Meu Agito de forma profissional, segura e preparada para crescimento.

Este arquivo não cria recursos.  
Ele documenta a arquitetura de rede que será revisada antes da criação da infraestrutura.

---

## Região principal

Region: sa-east-1  
Nome: América do Sul (São Paulo)

---

## Componentes de rede previstos

### 1. VPC

A VPC será a rede isolada principal do Meu Agito dentro da AWS.

Objetivo:

- isolar os recursos do projeto;
- controlar tráfego de entrada e saída;
- separar recursos públicos e privados;
- permitir escalabilidade futura.

---

### 2. Subnets públicas

Uso previsto:

- Application Load Balancer;
- recursos que precisam receber tráfego público controlado.

Regras:

- não hospedar banco em subnet pública;
- não hospedar Redis em subnet pública;
- não colocar backend diretamente exposto sem Load Balancer.

---

### 3. Subnets privadas

Uso previsto:

- ECS Fargate backend;
- RDS PostgreSQL;
- ElastiCache Redis/Valkey.

Regras:

- banco deve ficar privado;
- Redis deve ficar privado;
- backend deve preferencialmente rodar privado atrás do Load Balancer;
- tráfego externo deve entrar pelo ALB.

---

### 4. Internet Gateway

Uso previsto:

- permitir entrada pública controlada para recursos em subnets públicas;
- permitir funcionamento do ALB público.

---

### 5. NAT Gateway

Uso previsto:

- permitir que recursos privados acessem a internet para baixar dependências, chamar APIs externas ou enviar requisições.

Decisão inicial:

- evitar NAT Gateway se possível por custo;
- só criar se o backend em subnet privada precisar de saída para internet e não houver alternativa melhor;
- avaliar alternativas antes da criação.

Atenção:

- NAT Gateway gera custo recorrente;
- não criar automaticamente sem revisão.

---

### 6. Application Load Balancer

Uso previsto:

- entrada pública HTTPS da API;
- suporte a WebSocket/Socket.IO;
- health check;
- balanceamento para tasks ECS;
- ponto único de exposição pública do backend.

Regras:

- ALB deve ficar em subnets públicas;
- ECS deve receber tráfego do ALB;
- segurança deve ser controlada por Security Groups;
- certificados devem ser gerenciados pelo ACM.

---

### 7. Security Groups

Security Groups previstos:

#### ALB Security Group

Permitir entrada:

- HTTP 80 apenas para redirecionamento para HTTPS;
- HTTPS 443 público.

Permitir saída:

- para o Security Group do ECS backend na porta da aplicação.

#### ECS Backend Security Group

Permitir entrada:

- somente do ALB Security Group;
- porta da aplicação definida pelo backend.

Permitir saída:

- RDS PostgreSQL;
- ElastiCache Redis/Valkey;
- S3/CloudFront/provedores externos quando necessário;
- e-mail/push/observabilidade quando necessário.

#### RDS Security Group

Permitir entrada:

- somente do ECS Backend Security Group;
- porta PostgreSQL.

Não permitir entrada pública.

#### ElastiCache Security Group

Permitir entrada:

- somente do ECS Backend Security Group;
- porta Redis/Valkey.

Não permitir entrada pública.

---

## Princípios obrigatórios de rede

- Banco nunca deve ser público.
- Redis nunca deve ser público.
- Backend não deve ser exposto diretamente sem ALB.
- Tráfego público deve entrar pelo ALB.
- HTTPS deve ser obrigatório em produção.
- WebSocket deve passar pelo ALB.
- Security Groups devem ser restritivos.
- Região padrão deve ser sa-east-1.
- Recursos fora da região principal exigem justificativa.

---

## CIDR e quantidade de subnets

A definição exata de CIDR deve ser feita antes da criação da infraestrutura.

Estrutura recomendada:

- 1 VPC;
- pelo menos 2 subnets públicas em zonas de disponibilidade diferentes;
- pelo menos 2 subnets privadas em zonas de disponibilidade diferentes.

Objetivo:

- permitir alta disponibilidade básica;
- permitir uso de ALB;
- permitir RDS/ElastiCache privados;
- preparar ECS para múltiplas tasks.

---

## Decisões pendentes antes da criação

- CIDR principal da VPC;
- quantidade final de subnets;
- uso ou não de NAT Gateway;
- porta final do backend;
- domínio/subdomínio da API;
- estratégia de saída para internet do ECS;
- estratégia de endpoints privados AWS, se necessário.

---

## Critérios de aceite

Antes de criar os recursos, o plano deve garantir:

- ALB público;
- ECS protegido atrás do ALB;
- RDS privado;
- Redis privado;
- S3 acessado por IAM/policies;
- CloudFront para mídia quando aplicável;
- HTTPS com ACM;
- Security Groups restritivos;
- custo de NAT Gateway revisado.

---

## Próximo documento relacionado

AWS_SECURITY_PLAN.md
