# CampanhaCerta

Sistema para ajudar empresas a organizar e visualizar campanhas de marketing:
criação e acompanhamento de campanhas, orçamento, público-alvo, métricas de
desempenho, calendário de publicações e relatórios.

## Status do projeto

O repositório tem duas partes:

- `frontend/`: React com todas as telas do produto (RF01–RF10).
- `backend/`: API Flask + SQLite real, com autenticação (senha com hash),
  persistência e controle de acesso por perfil.

A camada `frontend/src/services/` concentra o acesso a dados e tem **dois
adaptadores** por arquivo: um mock em `localStorage` (usado nos testes e
quando não há `VITE_API_URL` configurada) e um HTTP que chama o backend Flask.
Os componentes não sabem qual dos dois está ativo — a escolha é só a presença
da variável de ambiente.

## Como rodar

### Via Docker (recomendado — frontend + backend)

```bash
docker compose up --build
```

Frontend em http://localhost:8080, API em http://localhost:5001/api. O banco
SQLite persiste no volume `backend-data`; o container semeia os dados de
demonstração sozinho no primeiro boot (é seguro rodar de novo — se já
houver usuários, não faz nada).

### Localmente (desenvolvimento)

Backend:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
flask seed      # popula usuários/campanhas de demonstração
flask run       # http://localhost:5001 — porta e FLASK_APP já vêm do .flaskenv
```

Não use `--port 5000`: no macOS essa porta é ocupada pelo AirPlay Receiver do
próprio sistema, que responde no lugar do Flask e dá erro de conexão sem
avisar por quê.

Frontend (em outro terminal):

```bash
cd frontend
cp .env.example .env.local   # aponta para http://localhost:5001/api
npm install
npm run dev
```

Sem `.env.local` (ou sem `VITE_API_URL`), o frontend volta a rodar 100% mockado
em `localStorage` — útil para demonstrar telas sem subir o backend.

## Login de demonstração

O cadastro mockado já vem com dois usuários semeados (dados fake, sem relação
com pessoas reais):

| E-mail | Senha | Perfil |
|---|---|---|
| admin@campanhacerta.com | admin123 | admin |
| analista@campanhacerta.com | analista123 | analista |

Não há cadastro público — criar conta é uma ação restrita a administradores,
pela tela `/usuarios/novo` (só aparece no menu para quem está logado como
admin). O perfil da nova conta é escolhido por quem cria (`admin` ou
`analista`).

## Perfis e permissões (RF09)

| Ação | Administrador | Analista |
|---|---|---|
| Ver campanhas, dashboard, calendário | Sim | Sim |
| Criar/editar campanhas | Sim | Sim |
| Registrar gastos, métricas e publicações | Sim | Sim |
| **Criar novos usuários** | Sim | **Não** |
| **Excluir campanhas** | Sim | **Não** |

O perfil ativo aparece na barra de navegação ("Perfil: admin/analista"). A
restrição de criação de usuário é aplicada no backend (`@admin_required` em
`POST /api/auth/users`), não só escondendo o botão na tela.

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
7. Ainda como admin, abra **Novo usuário** no menu e crie uma conta (RF01,
   RF09) — o link só existe pra quem está logado como admin.
8. Saia e entre como `analista@campanhacerta.com` / `analista123`: repare que
   "Novo usuário" some do menu e o botão "Excluir" some da listagem de
   campanhas (RF09).
9. De volta como admin, exporte o relatório em **Exportar CSV** na tela de
   detalhes da campanha (RF10).

## Checklist de requisitos funcionais

| RF | Descrição | Onde verificar |
|---|---|---|
| RF01 | Cadastro (admin) e login | `/usuarios/novo`, `/login` |
| RF02 | CRUD de campanhas | `/campanhas` |
| RF03 | Público-alvo da campanha | Formulário de campanha |
| RF04 | Registro de gastos | Detalhe da campanha |
| RF05 | Alerta de orçamento | Detalhe da campanha |
| RF06 | Métricas manuais + CSV | Detalhe da campanha |
| RF07 | Painel com KPIs e CTR/CPA/ROI | `/dashboard` (Visão Geral) |
| RF08 | Calendário de publicações | `/calendario` |
| RF09 | Perfis e permissões | Admin vs. analista |
| RF10 | Exportação de relatório | Botão "Exportar CSV" |

RNF03 (hash de senha) está implementado no backend (`werkzeug.security`).
RNF02 (tempo de resposta) e RNF04 (hospedagem gratuita) são validados na
implantação — ver [Débito de processo](#próximos-passos) abaixo.

## Contrato de `services/*.js`

Cada arquivo em `frontend/src/services/` exporta as mesmas funções para os
dois adaptadores (mock e HTTP), então os componentes nunca mudam:

- `authService`: `login({email, password})`, `createUser({name, email, password, role})`
  (restrito a admin), `logout()`, `getStoredUser()`.
- `campaignService`: `getCampaigns()`, `getCampaignById(id)`,
  `createCampaign(data)`, `updateCampaign(id, updates)`, `deleteCampaign(id)`.
- `expenseService`: `getExpensesByCampaign(campaignId)`, `createExpense(data)`.
- `metricService`: `getMetricsByCampaign(campaignId)`, `createMetric(data)`,
  `parseMetricsCsv(csvText)` (pura, sem I/O), `importMetricsCsv(campaignId, csvText)`.
- `publicationService`: `getPublications()`, `getPublicationById(id)`,
  `getPublicationsByMonth(year, month)`, `createPublication(data)`,
  `updatePublication(id, updates)`.

Endpoints correspondentes na API (todos sob `/api`, exceto `/health`):
`POST /auth/login`, `GET /auth/me`, `POST /auth/users` (exige perfil admin),
`GET|POST /campaigns`,
`GET|PUT|DELETE /campaigns/<id>` (DELETE exige perfil admin),
`GET|POST /campaigns/<id>/expenses`, `GET|POST /campaigns/<id>/metrics`,
`POST /campaigns/<id>/metrics/import-csv` (corpo: CSV cru),
`GET|POST /publications`, `GET|PUT /publications/<id>`,
`GET /publications/month/<year>/<month>`.

## Testes

```bash
cd frontend && npm test    # 116 testes — sempre contra o adaptador mock
cd backend && source .venv/bin/activate && pytest   # contra SQLite em memória
```

## Próximos passos

- Estratégia de branches e Issues no GitHub (bloco 2.1 da EAP) — ainda não
  criada neste repositório.
- Deploy do backend em hospedagem gratuita (RNF04) e apontar o build do
  frontend (`VITE_API_URL`) para a URL pública.

## Licença

Distribuído sob a licença MIT — veja [LICENSE](./LICENSE).
