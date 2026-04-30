# Meu Agito — AWS Database Plan

## Objetivo

Definir o plano de banco de dados para hospedar o Meu Agito na AWS usando Amazon RDS for PostgreSQL.

Este arquivo não cria recursos.  
Ele documenta as decisões técnicas que devem ser revisadas antes da criação do banco.

---

## Serviço alvo

Amazon RDS for PostgreSQL

Uso:

- banco principal do Meu Agito;
- persistência de usuários;
- perfis;
- posts;
- comentários;
- curtidas;
- seguidores;
- eventos;
- estabelecimentos;
- produtos/vitrine;
- conversas;
- mensagens;
- notificações;
- audit logs.

---

## Região

Region: sa-east-1  
Nome: América do Sul (São Paulo)

---

## Regras obrigatórias

- O banco não deve ser público.
- O banco deve ficar em subnets privadas.
- O banco deve aceitar conexão apenas do backend.
- Credenciais não devem ficar no código.
- DATABASE_URL deve vir de Secrets Manager ou SSM Parameter Store.
- Migrations devem ser controladas.
- Backups automáticos devem estar habilitados.
- Arquivos e imagens não devem ser salvos no banco.
- O banco deve armazenar apenas URLs e metadados de mídia.

---

## PostgreSQL e Prisma

O projeto deve continuar usando:

- PostgreSQL;
- Prisma;
- migrations Prisma;
- DATABASE_URL.

Requisitos:

- schema.prisma deve continuar usando provider PostgreSQL.
- Migrations devem ser executadas de forma controlada antes do start final da aplicação.
- O backend deve falhar de forma clara se DATABASE_URL estiver ausente ou inválida.
- A estratégia de conexão deve considerar ambiente gerenciado.

---

## PostGIS

PostGIS deve ser considerado para:

- busca por proximidade real;
- ordenação por distância;
- filtros geográficos;
- eventos próximos;
- estabelecimentos próximos;
- feed local/próximo.

Decisão:

- habilitar PostGIS quando a implementação de Geo/Discovery exigir distância real;
- evitar manter apenas bounding-box simples como solução definitiva.

---

## Segurança

O banco deve ser protegido por:

- subnets privadas;
- Security Group próprio;
- entrada permitida apenas do Security Group do ECS backend;
- sem exposição pública;
- credenciais em Secrets Manager ou SSM;
- senha forte;
- logs sem dados sensíveis.

---

## Backups e retenção

Configurar:

- backups automáticos;
- janela de backup;
- retenção adequada ao estágio do projeto;
- snapshots antes de alterações críticas;
- estratégia de restore documentada.

---

## Extensões

Extensões possíveis:

- PostGIS, quando necessário;
- extensões auxiliares apenas com justificativa técnica.

Nenhuma extensão deve ser habilitada sem necessidade clara.

---

## Performance

Preparar para:

- índices em campos de feed;
- índices em relações sociais;
- índices em estabelecimentos;
- índices em eventos;
- índices geográficos quando PostGIS estiver ativo;
- paginação por cursor;
- evitar queries N+1;
- evitar armazenar payloads grandes no banco;
- monitorar queries lentas.

---

## Dados que não devem ficar no banco

Não armazenar no PostgreSQL:

- imagens em base64;
- anexos de chat em base64;
- arquivos binários;
- secrets;
- tokens sensíveis em texto puro;
- logs excessivos de aplicação.

---

## Dados que podem ficar no banco

Armazenar no banco:

- URLs de mídia;
- paths de storage;
- metadados de arquivo;
- usuários;
- relacionamentos;
- permissões;
- posts;
- eventos;
- estabelecimentos;
- produtos/vitrine;
- mensagens;
- notificações;
- audit logs.

---

## Variáveis relacionadas

- DATABASE_URL
- NODE_ENV
- variáveis de migration, se existirem no projeto
- variáveis de pool/conexão, se forem adotadas

---

## Critérios de aceite antes do deploy

- RDS privado.
- Backend consegue conectar.
- Migrations executadas com sucesso.
- PostGIS definido quando necessário.
- Backups habilitados.
- Security Group restritivo.
- Nenhum arquivo pesado salvo no banco.
- DATABASE_URL não versionada.
- Health check valida conectividade com banco.

---

## Pendências antes da criação do recurso

- Definir tamanho inicial da instância.
- Definir storage inicial.
- Definir retenção de backup.
- Definir se Multi-AZ será usado agora ou depois.
- Definir se PostGIS será habilitado já na primeira versão AWS.
- Definir estratégia de migration no pipeline.
- Definir estratégia de seed, se necessário.

---

## Próximo documento relacionado

AWS_STORAGE_PLAN.md
