# TWZRD Live 0→1Q

Public multi-agent host for TWZRD Q1 execution.

**Product job:** Trust infrastructure for agents that spend money.  
One question before funds move: *Who is this counterparty, and should I trust them?*

**Canonical entry for agents**

```text
https://twzrd-live-01q-host.vercel.app/llms.txt
→ https://twzrd-live-01q-host.vercel.app/api/board
```

| Surface | Path |
|---|---|
| Agent guide | `/llms.txt` |
| Full board JSON | `/api/board` (`cascade`, `decision_spine`, metrics) |
| Path B runbook | `/api/path-b` |
| Path B artifacts (PRIMARY metric) | `/api/path-b-artifacts` |
| Attestation demo | `/api/attestation` |
| Intel health proxy | `/api/intel-health` |

## Hierarchy

1. Message: trust for agents that spend money  
2. Primary action: check a counterparty  
3. Developer action: auto preflight + refuse-before-sign on the payment path  
4. Profiles/graph: evidence under the decision — not the product  
5. Payment Control: intelligence → enforced consequence  

**Intel is the memory window of the loop — not where the loop begins.**

## Cascade (actual)

```text
pay intent → operator auto-preflight → signed decision_id
  → allow | block before sign
  → settlement | blocked-before-sign
  → authenticated outcome
  → better next decision
```

Broken: directory fill → browse → buy checks. That chain never starts.

## Metric honesty

| Counter | Role |
|---|---|
| **`path_b_artifacts_external`** | **PRIMARY** |
| free cards external | Advisory |
| outcome joins | Tertiary (compounds) |
| `day0.gate_evals` | Settle-rail only |
| dogfood / outreach posts | Not external success |

## Decision spine (partial)

Present: `preflight_id` + soft settlement join.  
Missing (product PR B): cryptographic bind into x402 challenge/intent; authenticated outcome contract; decision₂ cites loop₁.

## Routing

```text
Live Board  → what next (cascade, Path B, CF posture)
intel.twzrd.xyz → should I pay? (preflight /trust — never this board alone)
SPRAT (sprat-brief) → strategy extract / history only
```

**First-seat kit:** [`public-machine/first-seat-kit/`](./public-machine/first-seat-kit/) — white-glove pack for Seat 1 (procedural label; not enrollment theater).

Board schema `twzrd.live_board/v1` · **1.5.0**
