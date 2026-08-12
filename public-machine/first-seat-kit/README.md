# First external seat — white-glove session kit (Path B seat 1)

**Audience:** Operator running the first **external** Path B seat. No partner is
booked yet — this kit is ready for whoever fills that seat, not a specific person.  
**Cascade:** Operator auto-preflight on a real path (shadow OK) → decision → settlement|refuse → minimal outcome. Outreach ≠ artifact.

**Not for:** Founder posts, internal dogfood counted as adoption, CF #1863 work.

One seat, run to completion, before opening a second. No named sequence — book
seat 2 when there's a real second candidate.

## Metric honesty (read first)

| Metric | Meaning |
|--------|---------|
| `day0.gate_evals` / `gate_blocks` | **Seller settle-rail only** (merchant wash/sybil at settle). Refuse bin does **not** increment these. |
| `path_b_artifacts` | **PRIMARY Path B success** — attributable `twzrd.path_b_artifact/v1` with matched BLOCK+ALLOW from an **operator-controlled** machine. |
| Self-serve refuse transcript | Dogfood. Field `closes_external_adoption_metric: false`. |

Founder post waits until **≥1 external path_b_artifact** exists.

## Session goals

1. Cold refuse works on **their** machine (signer_invocation_count=0).
2. Hook wires into their buyer pipeline (shadow OK first session; enforce is the artifact goal).
3. Capture matched **BLOCK + ALLOW** into `artifact.template.json`.
4. Fill friction log for runbook edits before booking the next seat.

## A. 30–90s cold verification

On a **clean** partner shell (not a TWZRD laptop alone):

```bash
npm i twzrd-x402-gate@0.8.14 x402-solana@2.1.0 @x402/core @x402/fetch @x402/svm @solana/kit @scure/base
node node_modules/twzrd-x402-gate/bin/twzrd-gate-eval-refuse.js
```

Or: `bash COLD_VERIFY.sh` from this directory after copy.

**Expected (excerpt):**

```json
{
  "schema": "twzrd.gate_eval_refuse.v1",
  "twzrd_decision": "block",
  "signer_invocation_count": 0,
  "payment_retry_count": 0,
  "verified": true,
  "closes_external_adoption_metric": false
}
```

Verified 2026-08-12: cold path ~35s on a clean temp dir.

## B. Matched-pair integration

See `matched-pair.snippet.ts`. Uses public APIs:

- `createTwzrdBeforePaymentHook` from `twzrd-x402-gate`
- `createX402Client` from `x402-solana` (PayAI seat)
- `attribution: { integration, runId }` for preflight headers

**BLOCK arm:** known refuse path (fixture or forced wash).  
**ALLOW arm:** known-good mainnet seller (e.g. live storefront `/report`) — requires a funded operator wallet; do not invent tx hashes.

## C. Artifact

Copy `artifact.template.json` → fill → keep off public post until fields are real. Schema: `twzrd.path_b_artifact/v1`.

## D. Friction log

`friction-log.template.md` — peer deps, time-to-first-decision, RPC/egress, operator quotes.

## Links

| Surface | URL |
|---------|-----|
| Path B runbook (JSON) | https://twzrd-live-01q-host.vercel.app/api/path-b |
| Live Board | https://twzrd-live-01q-host.vercel.app/api/board |
| Intel health | https://intel.twzrd.xyz/health |
| Refuse fixture | https://intel.twzrd.xyz/v1/intel/refuse-fixture |
| Gate package | https://www.npmjs.com/package/twzrd-x402-gate |
