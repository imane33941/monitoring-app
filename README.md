# 📡 Monitoring App

Surveille la disponibilité et la latence de tes services HTTP depuis un seul dashboard.

## Stack
- **packages/shared** — Contrats ts-rest + DTOs Zod partagés entre server et client
- **server** — NestJS · SQLite (MikroORM) · @nestjs/schedule · Resend
- **client** — React · Vite · Zustand (apiClient ts-rest) · Recharts

## Installation

```bash
git clone <repo>
cd monitoring-app

pnpm install

# Build shared en premier (server et client en dépendent)
pnpm run build:shared

# Config
cp server/.env.example server/.env
# → Renseigne RESEND_API_KEY et ALERT_EMAIL

# Lancer tout
pnpm run dev
```

- 🖥️  Dashboard → http://localhost:5174
- 🟢 API → http://localhost:3001/api/monitors

## Structure

```
monitoring-app/
├── packages/
│   └── shared/
│       └── src/
│           ├── contracts/
│           │   ├── api.contract.ts      ← Contrat racine (pathPrefix /api)
│           │   └── monitor.contract.ts  ← Routes monitors
│           ├── dtos/
│           │   └── monitor.dto.ts       ← Schemas Zod + types TypeScript
│           └── index.ts
├── server/
│   └── src/
│       ├── modules/
│       │   ├── monitors/
│       │   │   ├── monitor.entity.ts
│       │   │   ├── ping-result.entity.ts
│       │   │   ├── monitor.service.ts   ← Ping logic + cron
│       │   │   └── monitor.controller.ts ← @TsRestHandler
│       │   └── alerts/
│       │       └── alert.service.ts     ← Emails Resend (down + recovery)
│       └── main.ts
└── client/
    └── src/
        ├── api/
        │   └── client.ts                ← initClient ts-rest
        ├── stores/
        │   └── useMonitorStore.ts       ← Zustand (apiClient au lieu de fetch)
        └── App.tsx                      ← Dashboard complet
```

## Ajouter un projet à surveiller

Dans le dashboard → **Ajouter** :
- Nom : `Mon App — Production`
- URL : `https://mon-app.up.railway.app/api/health`
- Intervalle : 1 minute
- Email d'alerte : laisser vide → utilise ALERT_EMAIL du .env
