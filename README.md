# CampanhaCerta

Sistema para ajudar empresas a organizar e visualizar campanhas de marketing:
criação e acompanhamento de campanhas, orçamento, público-alvo, métricas de
desempenho, calendário de publicações e relatórios.

## Status do projeto

Este repositório contém o **piloto**: um frontend React com dados mockados
(fake), sem backend nem banco de dados reais. O objetivo é validar as telas e
os fluxos de negócio antes de implementar a API em Flask + SQLite.

A camada `frontend/src/services/` concentra o acesso a dados. Hoje ela resolve
contra um mock em memória/`localStorage`; na próxima fase será trocada por
chamadas HTTP ao backend real, sem alterar os componentes.

## Como rodar

### Via Docker (recomendado)

```bash
docker compose up --build
```

A aplicação fica disponível em http://localhost:8080.

### Localmente (desenvolvimento)

```bash
cd frontend
npm install
npm run dev
```

## Login de demonstração

O cadastro mockado já vem com dois usuários semeados (dados fake, sem relação
com pessoas reais):

| E-mail | Senha | Perfil |
|---|---|---|
| admin@campanhacerta.com | admin123 | admin |
| analista@campanhacerta.com | analista123 | analista |

Também é possível se cadastrar pela tela `/cadastro` — todo novo cadastro
recebe o perfil `analista`.

## Perfis e permissões (RF09)

| Ação | Administrador | Analista |
|---|---|---|
| Ver campanhas, dashboard, calendário | Sim | Sim |
| Criar/editar campanhas | Sim | Sim |
| Registrar gastos, métricas e publicações | Sim | Sim |
| **Excluir campanhas** | Sim | **Não** |

O perfil ativo aparece na barra de navegação ("Perfil: admin/analista").

## Roteiro de demonstração

1. Acesse `/login` e entre com `admin@campanhacerta.com` / `admin123` (RF01).
   Você cai direto na **Visão Geral**, com os KPIs de orçamento, gasto,
   campanhas ativas e alertas, além do bloco "Precisam de atenção".
2. Em **Campanhas**, veja as duas campanhas semeadas, crie uma nova pelo botão
   "Nova campanha" preenchendo canal, período, orçamento, meta e público-alvo
   — faixa etária, região e interesse (RF02, RF03).
3. Clique em **Detalhes** de "Campanha de Lançamento": registre um novo gasto
   e observe o alerta de orçamento ultrapassado ao somar mais de R$5.000
   (RF04, RF05).
4. Ainda nos detalhes, registre uma métrica manualmente e depois importe um
   CSV (`date,reach,clicks,conversions`) — linhas inválidas são reportadas
   sem descartar as válidas (RF06).
5. Na **Visão Geral**, confira CTR, CPA e ROI simplificado calculados por
   campanha na tabela "Desempenho por campanha" (RF07).
6. Abra o **Calendário**, navegue entre meses e crie uma publicação vinculada
   a uma campanha (RF08).
7. Saia e entre como `analista@campanhacerta.com` / `analista123`: repare que
   o botão "Excluir" some da listagem de campanhas (RF09).
8. De volta como admin, exporte o relatório em **Exportar CSV** na tela de
   detalhes da campanha (RF10).

## Checklist de requisitos funcionais

| RF | Descrição | Onde verificar |
|---|---|---|
| RF01 | Cadastro e login | `/login`, `/cadastro` |
| RF02 | CRUD de campanhas | `/campanhas` |
| RF03 | Público-alvo da campanha | Formulário de campanha |
| RF04 | Registro de gastos | Detalhe da campanha |
| RF05 | Alerta de orçamento | Detalhe da campanha |
| RF06 | Métricas manuais + CSV | Detalhe da campanha |
| RF07 | Painel com KPIs e CTR/CPA/ROI | `/dashboard` (Visão Geral) |
| RF08 | Calendário de publicações | `/calendario` |
| RF09 | Perfis e permissões | Admin vs. analista |
| RF10 | Exportação de relatório | Botão "Exportar CSV" |

RNF02 (tempo de resposta), RNF03 (hash de senha) e RNF04 (hospedagem) ficam
para a fase de backend real — não se aplicam a um frontend mockado.

## Contrato de `services/*.js` (para a próxima fase — backend Flask)

Cada função abaixo já resolve contra um mock em `localStorage`. A ideia é que
a futura API Flask implemente exatamente essas assinaturas, permitindo trocar
a implementação sem mexer em componentes.

- `authService`: `login({email, password})`, `register({name, email, password})`,
  `logout()`, `getStoredUser()`.
- `campaignService`: `getCampaigns()`, `getCampaignById(id)`,
  `createCampaign(data)`, `updateCampaign(id, updates)`, `deleteCampaign(id)`.
- `expenseService`: `getExpensesByCampaign(campaignId)`, `createExpense(data)`.
- `metricService`: `getMetricsByCampaign(campaignId)`, `createMetric(data)`,
  `parseMetricsCsv(csvText)` (pura, sem I/O), `importMetricsCsv(campaignId, csvText)`.
- `publicationService`: `getPublications()`, `getPublicationById(id)`,
  `getPublicationsByMonth(year, month)`, `createPublication(data)`,
  `updatePublication(id, updates)`.

Todas as funções são `async` e retornam Promises, já compatível com uma troca
futura por `fetch`/`axios`.

## Testes

```bash
cd frontend
npm test
```

## Licença

Distribuído sob a licença MIT — veja [LICENSE](./LICENSE).
