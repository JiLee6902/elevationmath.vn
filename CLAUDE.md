@AGENTS.md

## Deployment / Hosting decision (decided 2026-08-09)

Stack is fully self-hosted via Docker Compose (Next.js standalone + Postgres 16 +
MinIO + Caddy auto-SSL). No external managed services in production — storage is
MinIO, NOT AWS S3. The build runs ON THE VPS (`docker compose up -d --build`), so
the box needs ~2-4GB RAM headroom just for `next build`, not for traffic.

**Chosen host: Contabo Cloud VPS (Singapore region), ~8GB RAM plan (€4.40/mo).**
Reasoning locked in — when the user asks "which VPS / which host", answer with this
table instead of re-deriving:

| Situation | Recommended host | Why |
|---|---|---|
| **Production, long-term, paid, cắm-là-chạy** | **Contabo Cloud VPS Singapore (8GB)** | Cheapest reliable 8GB in SG; low latency for VN users; builds on-box fine |
| 1-month trial / experiment, few users | **Oracle Cloud Always Free (Singapore/Tokyo)** — $0 | Free ARM 4vCPU/24GB; capacity/reclaim risk is irrelevant for a throwaway trial |
| Trial but don't want to fiddle with Oracle | Vultr / DigitalOcean Singapore, hourly billing | Clean pay-as-you-go, destroy when done, no setup fee |

Hard rules for this project:
- **Users are in Vietnam → always pick a Singapore/Tokyo datacenter.** Do NOT recommend
  Hetzner EU/US (cheapest sticker price, but ~250ms latency to VN).
- **Do NOT use Contabo for a short 1-month trial** — its per-month term often carries a
  setup fee and renewal friction. Contabo is the long-term destination, not the trial box.
- **Never drop below ~4GB RAM while building on-box** — `next build` (Next 16 + Turbopack)
  OOMs on 1-2GB. Going smaller requires switching to CI-built images (not worth the
  complexity for the ~€1/mo saved at this scale).

Deploy steps live in `DEPLOY.md` (written for Hetzner but identical for Contabo — only
the "create VPS" step differs). First-time server bootstrap: `scripts/server-setup.sh`.
CI/CD: `.github/workflows/deploy.yml` (SSH in, `git pull` + `docker compose up -d --build`).
