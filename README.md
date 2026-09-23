# Marketplace Deployment Dashboard

Executive and ops dashboard for Intuitive products listed or deployed across **AWS Marketplace**, **Azure Marketplace**, **Google Cloud Marketplace**, **Databricks Marketplace**, and **Anthropic Marketplace** — with drill-down into deployment health, user adoption, FinOps, and risks.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

Single-page dashboard with sidebar sections on `/`, plus product detail pages:

| Route / section | Purpose |
|---|---|
| `/#overview` … `/#report` | Main dashboard sections (incl. Team progress) |
| `/#progress` | Team ETAs, WIP, blockers, and latest updates |
| `/products/[id]` | Full product detail (listings, environments, adoption, spend) |

Legacy list routes (`/matrix`, `/products`, `/reports`) redirect into the matching hash section.

## Architecture

- **Next.js App Router** + TypeScript + Tailwind CSS v4
- **Seed data** in [`data/seed.ts`](data/seed.ts) — swap later via adapters in [`lib/data.ts`](lib/data.ts)
- **Types** in [`lib/types.ts`](lib/types.ts); status helpers in [`lib/status.ts`](lib/status.ts)
- **Charts** via Recharts (`TrendChart`)

```
seed / Excel(later) / APIs(later)
        → lib/data.ts adapters
        → app pages + components
```

## Product requirements

See [`docs/PRD.md`](docs/PRD.md) for personas, metrics, data model, and phased delivery.

## Phase notes

- **Phase 1 (this repo):** seed-backed MVP UI
- **Phase 2:** deeper FinOps, role views, CSV export
- **Phase 3:** Nancy-format Excel/CSV ingest
- **Phase 4:** marketplace Partner API sync + alerts

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
