# Matriz de Validade dos Documentos (2026-04-23)

## Escopo da revisao
- Revisao executada sobre **todos os arquivos** da pasta `doc/` (96 arquivos).
- Resultado: 53 arquivos fora de `99_HISTORICO/` e 43 arquivos historicos.
- Regra aplicada: codigo atual prevalece sobre qualquer documento.

## Classificacao usada
- `Canonico`: fonte de verdade para decisao/implementacao atual.
- `Referencia parcial`: util como guia, mas exige confirmacao no codigo atual.
- `Historico`: nao usar como fonte normativa.

## 00_GOVERNANCA
| Documento | Status | Acao |
|---|---|---|
| `00_GOVERNANCA/00_GUIA_DOCUMENTACAO.md` | Canonico | Manter e atualizar quando houver nova regra de manutencao. |
| `00_GOVERNANCA/01_ESTADO_ATUAL_2026-04-23.md` | Canonico | Atualizar a cada validacao tecnica relevante. |
| `00_GOVERNANCA/02_ROADMAP_ATE_FINALIZACAO.md` | Canonico | Atualizar a cada fechamento de fase. |
| `00_GOVERNANCA/03_MAPA_RENOMEACOES_2026-04-21.md` | Canonico | Manter para rastreabilidade; editar somente quando houver novas migracoes. |
| `00_GOVERNANCA/04_MATRIZ_VALIDADE_DOCUMENTOS_2026-04-23.md` | Canonico | Atualizar junto com o estado atual. |

## 01_PRODUTO
| Documento | Status | Acao |
|---|---|---|
| `01_PRODUTO/README.md` | Canonico | Manter. |
| `01_PRODUTO/01_PRD_MEUAGITO.md` | Referencia parcial | Validar itens de escopo com backlog real antes de implementar. |
| `01_PRODUTO/02_REDE_SOCIAL_COMPLETA_V3.md` | Referencia parcial | Usar como visao alvo; nao tratar como pronto tecnico. |
| `01_PRODUTO/03_PAINEL.md` | Referencia parcial | Manter como especificacao de produto/UX. |
| `01_PRODUTO/04_MODAL_TROCA_CIDADE.md` | Referencia parcial | Manter como especificacao de fluxo. |

## 02_UX_FLUXOS
| Documento | Status | Acao |
|---|---|---|
| `02_UX_FLUXOS/README.md` | Canonico | Manter. |
| `02_UX_FLUXOS/01_T01_SPLASH_SCREEN.md` | Referencia parcial | Confirmar aderencia no app antes de marcar concluido. |
| `02_UX_FLUXOS/02_T02_ONBOARDING.md` | Referencia parcial | Confirmar aderencia no app antes de marcar concluido. |
| `02_UX_FLUXOS/03_T03_LOGIN_CADASTRO.md` | Referencia parcial | Revalidar contrato de cadastro com backend. |
| `02_UX_FLUXOS/04_T04_ESCOLHA_PERFIL.md` | Referencia parcial | Manter como especificacao de fluxo. |
| `02_UX_FLUXOS/05_T05A_CONFIG_CONTA_PESSOAL.md` | Referencia parcial | Manter como especificacao de fluxo. |
| `02_UX_FLUXOS/06_T05B_CADASTRO_EMPRESARIAL.md` | Referencia parcial | Manter como especificacao de fluxo. |
| `02_UX_FLUXOS/07_T06_HOME.md` | Referencia parcial | Manter como referencia visual/funcional. |
| `02_UX_FLUXOS/08_T07_BUSCA_COMPLETA.md` | Referencia parcial | Manter como referencia visual/funcional. |
| `02_UX_FLUXOS/09_T13_CENTRAL_NOTIFICACOES.md` | Referencia parcial | Manter como referencia visual/funcional. |
| `02_UX_FLUXOS/10_T_PERFIL_TEMPLATE_UNIVERSAL.md` | Referencia parcial | Manter como referencia visual/funcional. |
| `02_UX_FLUXOS/11_T_ITEM_UNIVERSAL.md` | Referencia parcial | Manter como referencia visual/funcional. |
| `02_UX_FLUXOS/12_T_CATALOGO_UNIVERSAL.md` | Referencia parcial | Manter como referencia visual/funcional. |
| `02_UX_FLUXOS/13_T_AGITO_FEED_SOCIAL.md` | Referencia parcial | Manter como referencia visual/funcional. |
| `02_UX_FLUXOS/14_T_ATIVIDADE.md` | Referencia parcial | Manter como referencia visual/funcional. |
| `02_UX_FLUXOS/15_T_CONFIG_CONFIGURACOES.md` | Referencia parcial | Manter como referencia visual/funcional. |

## 03_ARQUITETURA_E_ESTRATEGIA
| Documento | Status | Acao |
|---|---|---|
| `03_ARQUITETURA_E_ESTRATEGIA/README.md` | Canonico | Manter. |
| `03_ARQUITETURA_E_ESTRATEGIA/01_TECHNICAL_BLUEPRINT.md` | Referencia parcial | Conferir com implementacao atual antes de executar mudancas grandes. |
| `03_ARQUITETURA_E_ESTRATEGIA/02_TECNOLOGIAS_PROJETO.md` | Referencia parcial | Atualizar quando stack real mudar. |
| `03_ARQUITETURA_E_ESTRATEGIA/03_STRATEGIC_SUGGESTIONS.md` | Referencia parcial | Tratar como recomendacao, nao como estado atual. |
| `03_ARQUITETURA_E_ESTRATEGIA/04_ESTRATEGIA_UNIFICADA_FINAL.md` | Referencia parcial | Tratar como direcionamento de medio prazo. |
| `03_ARQUITETURA_E_ESTRATEGIA/05_ALTERNATIVAS_GOOGLE_PLACES.md` | Referencia parcial | Confirmar aplicabilidade no escopo atual. |
| `03_ARQUITETURA_E_ESTRATEGIA/06_GEOLOCALIZACAO_AUTOMATICA.md` | Referencia parcial | Confirmar aderencia com implementacao atual. |
| `03_ARQUITETURA_E_ESTRATEGIA/07_GEOLOC_APIS_POPULACAO.md` | Referencia parcial | Confirmar aderencia com implementacao atual. |
| `03_ARQUITETURA_E_ESTRATEGIA/08_CACHE_BACKEND_OVERPASS.md` | Referencia parcial | Confirmar aderencia com implementacao atual. |

## 04_BACKEND
| Documento | Status | Acao |
|---|---|---|
| `04_BACKEND/README.md` | Canonico | Manter. |
| `04_BACKEND/01_REFERENCIA_API_BACKEND.md` | Canonico | Atualizar sempre que contrato de endpoint mudar. |
| `04_BACKEND/02_QUICK_START_AUTH.md` | Referencia parcial | Validar comandos/variaveis no ambiente atual. |
| `04_BACKEND/03_AUTH_MODULE_COMPLETO.md` | Referencia parcial | Validar detalhes com codigo atual. |
| `04_BACKEND/04_USERS_MODULE_COMPLETO.md` | Referencia parcial | Validar detalhes com codigo atual. |
| `04_BACKEND/05_FEED_MODULE_COMPLETO.md` | Referencia parcial | Validar detalhes com codigo atual. |
| `04_BACKEND/06_SEARCH_MODULE_COMPLETO.md` | Referencia parcial | Validar detalhes com codigo atual. |
| `04_BACKEND/07_EVENTS_ESTABLISHMENTS_COMPLETO.md` | Referencia parcial | Validar detalhes com codigo atual. |
| `04_BACKEND/08_CHAT_MODULE_COMPLETO.md` | Referencia parcial | Validar detalhes com codigo atual. |

## 05_REALTIME_SOCKET
| Documento | Status | Acao |
|---|---|---|
| `05_REALTIME_SOCKET/README.md` | Canonico | Manter. |
| `05_REALTIME_SOCKET/01_SOCKET_IO_QUICKSTART.md` | Referencia parcial | Nao tratar como "pronto para producao" sem validacao e2e de frontend. |
| `05_REALTIME_SOCKET/02_SOCKET_IO_INTEGRATION_GUIDE.md` | Referencia parcial | Usar como guia tecnico. |
| `05_REALTIME_SOCKET/03_SOCKET_IO_TESTING_GUIDE.md` | Referencia parcial | Usar como plano de validacao. |

## 06_LEGAL
| Documento | Status | Acao |
|---|---|---|
| `06_LEGAL/README.md` | Canonico | Manter. |
| `06_LEGAL/01_POLITICA_DE_PRIVACIDADE.md` | Canonico | Revisar antes de release publico. |
| `06_LEGAL/02_TERMOS_DE_USO.md` | Canonico | Revisar antes de release publico. |
| `06_LEGAL/03_BASE_NORMATIVA_E_CHECKLIST_LOJAS.md` | Canonico | Manter como checklist obrigatorio de publicacao. |

## 99_HISTORICO
- `99_HISTORICO/*` (43 arquivos): **Historico**.
- Uso permitido: auditoria/rastreabilidade.
- Uso proibido: base para decisao de implementacao atual sem reconfirmar no codigo.

## Resultado consolidado
- Estado atual de documentacao: **organizado e rastreavel**.
- Decisao operacional: usar prioridade de leitura definida em `doc/README.md`.
- Proxima manutencao obrigatoria: atualizar este arquivo junto com o proximo snapshot de estado tecnico.
