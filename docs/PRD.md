# Marketplace Deployment Status Report Dashboard — PRD

**Status:** Approved for MVP implementation  
**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS  
**Data:** Seed-first; Excel/API ingest later behind the same adapters  
**Scope:** Marketplace listing portfolio + deployment health + user adoption drill-down

---

## 1. Problem statement

Leadership and product owners lack a single view of which Intuitive products and agents are listed or live on each marketplace (AWS, Azure, GCP, Databricks, Anthropic), whether deployments are healthy, and whether customers are adopting them. Status today is scattered across Excel exports, owner updates, and incomplete dashboard prototypes with dummy metrics.

## 2. Goals

- One executive surface for marketplace listing and deployment status across all target marketplaces
- Drill-down from marketplace → product → environment → usage / FinOps
- Support personas: executive, product owner, alliance / marketplace lead, ops / FDE
- Ship a usable MVP with coherent seed data; swap to APIs or Excel batch ingest without redesigning the UI

## 3. Non-goals (v1)

- Live marketplace Partner API sync
- Billing settlement or CRM replacement
- Full agent debugging / execution traces (owned by per-agent ops tools)
- Production authentication (role switcher stub only in MVP)

## 4. Personas & jobs to be done

| Persona | Jobs to be done |
|---|---|
| Executive | Are we live on the right marketplaces? Are adoption and spend healthy? What are the top risks? |
| Alliance / marketplace lead | Listing pipeline, review blockers, partner-sourced installs |
| Product owner | Per-product status across clouds, users, success rate, cost |
| Ops / FDE | Deployment health, rollbacks, incidents, data freshness |

## 5. Use cases

1. Portfolio RAG by marketplace (listed / in review / draft / not started / deprecated)
2. Cross-cloud deployment matrix (product × marketplace × status)
3. Adoption: DAU / WAU / MAU, installs, active tenants, tasks executed
4. Reliability: success rate, failure rate, uptime signals, rollbacks
5. FinOps: spend per product, cost per successful task, cost anomalies
6. Lifecycle: version, last deploy, time-to-list
7. Risk board: stalled listings, failing deploys, low adoption, cost overruns — with owner
8. Status report view suitable for ELT walkthroughs (CSV export in Phase 2)

## 6. Information architecture

```
/                     Executive overview
/marketplaces/[slug]  Marketplace deep dive
/products             Product catalog
/products/[id]        Product detail
/matrix               Product × marketplace matrix
/reports              Print-friendly status report
```

Drill path: Executive → Marketplace or Matrix → Product → Environments / Usage / Listing timeline.

## 7. Metrics

### Executive KPI strip

- Products live (any marketplace)
- Listings in review / blocked
- Total MAU
- Deployment health % (weighted success rate)
- AI / marketplace-related spend (MTD)
- Open P0 / P1 risks

### Marketplace cards

Per marketplace: live count, in-review count, installs / MAU proxy, last status change, health badge.

### Product table

Name, owner, marketplaces live, deployment status, success %, MAU, spend MTD, version, last updated, risk flag.

### Product detail

- Listing timeline per marketplace
- Environments (prod / staging / sandbox)
- Adoption trends
- Quality (success / escalation / error rates)
- FinOps (spend, cost per success)
- Catalog metadata (owner, purpose, dependencies)

### Phase 2+ (schema-aware, not fully built)

Hallucination / groundedness, agent-to-agent handoff success, policy violations, hours saved / business value, partner-sourced revenue, time-to-list SLA.

## 8. Status model

Shared enum:

`not_started` | `draft` | `in_review` | `listed` | `deployed` | `degraded` | `failed` | `deprecated`

## 9. Data model

| Entity | Key fields |
|---|---|
| Marketplace | id, name, slug, cloud, icon |
| Product | id, name, owner, category, description, version |
| Listing | productId, marketplaceId, status, submittedAt, listedAt, listingUrl, blockers[] |
| Deployment | productId, marketplaceId, env, status, successRate, lastDeployAt, rollbackCount |
| UsageSnapshot | productId, date, dau, wau, mau, installs, activeTenants, tasksExecuted |
| CostSnapshot | productId, marketplaceId?, date, amountUsd, costPerSuccess |
| Risk | id, severity, title, owner, relatedProductId?, relatedMarketplaceId?, status |

**Ingest path (post-MVP):** Excel / CSV (Nancy agent log format) → normalize into this schema → optional Partner APIs / CloudWatch / Databricks billing.

## 10. Phased delivery

| Phase | Scope |
|---|---|
| 0 | Scaffold, design tokens, seed data |
| 1 (MVP) | Executive home, marketplace detail, products, matrix, status report, filters |
| 2 | Trend charts depth, cost anomalies, role switcher, CSV export |
| 3 | Real Excel/CSV ingest, freshness indicators |
| 4 | Marketplace API sync, Slack / email alerts |

## 11. Success criteria (MVP)

- Exec can answer in under 30 seconds: products live per marketplace, blockers, top 3 risks
- Product owner can open one product and see listing + deploy health + MAU + spend
- Matrix shows complete product × marketplace coverage
- Seed data is coherent enough for a live demo

## 12. Meeting context

Informed by:

- Agentic Dashboard KPI hierarchy (executive → per-agent → ecosystem)
- Existing 9-product executive view and Nancy logging format as interim data source
- Anthropic Marketplace deployment target and multi-cloud (AWS / Azure / GCP / Databricks) partnership push
