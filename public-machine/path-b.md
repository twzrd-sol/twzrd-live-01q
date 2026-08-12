# Path B External Integration Runbook

schema: twzrd.path_b_runbook/v1 · version 1.2.0
generated_at: 2026-08-12T04:13:29.000Z

**Claim:** Externally controlled payment-path trust: operator auto-calls TWZRD before pay; decision can BLOCK before sign or ALLOW with joinable settlement; minimal outcome closes the loop so the next decision improves.

**Why first:** Agents do not browse a directory before every payment. The cascade starts at the **operator/facilitator** layer (auto preflight, shadow OK). `path_b_artifacts_external` is the primary seat proof. Soft preflight→settlement association exists; **cryptographic `decision_id` bind + authenticated outcome** are product spine (PR B). `day0.gate_evals` is settle-rail only. Public outreach is delivery only — not an artifact.

**Intel’s role:** intel.twzrd.xyz is the **window into the memory the loop creates**, not where the loop begins.

## Cascade (actual)

```text
pay intent
  → operator auto-calls /trust or preflight
  → signed decision_id
  → allow | block (enforced before sign)
  → settlement receipt | blocked-before-sign proof
  → authenticated minimal outcome
  → score/policy improves
  → next decision is better
```

## Metric doctrine

| Counter | Role |
|---|---|
| **path_b_artifacts_external** | **PRIMARY** Path B seat success |
| free_card_hits_external | Advisory demand only |
| closed_loop_outcome_joins | Tertiary — compounds intelligence |
| day0.gate_evals / gate_blocks | Settle-rail only — **not** buyer Path B |
| self-serve dogfood | `closes_external_adoption_metric: false` |
| public @mention / DM | Delivery only — **not** a closed loop |

**North star:** ≥1 external `twzrd.path_b_artifact/v1`, then close decision→settlement|block→outcome so decision₂ can cite loop₁. **Not** `day0.gate_evals`. **Not** directory size.

**Not this runbook:** Pay decisions → https://intel.twzrd.xyz/v1/intel/preflight. Free preflight ≠ product. Leaderboards/profiles are evidence UI, not the CTA.

## Decision spine (status)

```text
signed decision_id → gate artifact → payment intent
  → settlement | blocked-before-sign → authenticated outcome → evidence
```

Present: `preflight_id`, soft `preflight_request_id` on settlement (~30m).  
Missing (PR B): crypto bind into x402 challenge/intent; first-class outcome attestation; compounding demo.

## Order of ops

1. This runbook (screen-share ready)
2. BLOCK/ALLOW evidence-capture checklist
3. Run **Seat 1** (then Seat 2, Seat 3) — procedural labels, not invented roster claims
4. Capture one attributable external Path B artifact
5. Join outcome on the same decision_id
6. Founder post with **closed loop** proof — not enrollment theater


## Install (cold machine)

```bash
npm i twzrd-x402-gate@0.8.14 x402-solana@2.1.0 @x402/core @x402/fetch @x402/svm @solana/kit @scure/base
node node_modules/twzrd-x402-gate/bin/twzrd-gate-eval-refuse.js
```
Expected: `signer_invocation_count=0 payment_retry_count=0`

## Screen-share steps

### 1. Prep the seat (before screen-share) (5 min)
Operator: You (TWZRD)

Confirm intel health is green. Open Live Board funnel. Do not lead with MCP catalog or CF strategy. Hero line only: before your agent signs, TWZRD can refuse.

Expected:
- intel.twzrd.xyz/health returns ok
- path_b_artifacts_external baseline noted (usually 0); day0.gate_evals is settle-rail only — do not use as Path B baseline
- Partner machine has Node 20+ and network egress

Pitfalls:
- Do not open with free-card volume or internal swarm hits
- Do not demo V6 paid proof before refuse

### 2. Cold-machine refuse proof (their shell) (3–5 min)
Operator: Partner shares terminal

They paste the install one-liner and run the refuse eval binary. No wallet. No USDC. Goal is a clean refuse before any signer invocation.

```
npm i twzrd-x402-gate@0.8.14 x402-solana@2.1.0 @x402/core @x402/fetch @x402/svm @solana/kit @scure/base
node node_modules/twzrd-x402-gate/bin/twzrd-gate-eval-refuse.js
```

Expected:
- Process exits with signer_invocation_count=0
- payment_retry_count=0
- Transcript / JSON includes a BLOCK (or refuse) decision path

Pitfalls:
- If peer deps fail, stop and fix as P0 — do not hand-wave past install friction
- Never run this only on a TWZRD laptop and call it external

### 3. Wire gate into their buyer pipeline (10–15 min)
Operator: Partner + you

Install onBeforePayment / fetch wrapper so every payment attempt hits preflight + gate before signTransaction. Shadow mode is allowed for first session; enforce is the goal for the artifact.

```
// Pseudocode — place before any signTransaction
import { createTwzrdGate } from "twzrd-x402-gate"; // or package entry from README

const gate = createTwzrdGate({
  intelBase: "https://intel.twzrd.xyz",
  mode: "enforce", // or "shadow" for 14-day white-glove
});

async function onBeforePayment(intent) {
  const decision = await gate.evaluate(intent);
  // Log: decision, payer lineage, merchant, amount, ts
  if (decision.action === "BLOCK") {
    throw new Error("TWZRD_GATE_BLOCK: " + decision.reason);
  }
  return decision; // ALLOW → proceed to sign
}
```

Expected:
- Every payment attempt calls evaluate before sign
- BLOCK throws / aborts without touching signer
- ALLOW continues to existing sign path unchanged

Pitfalls:
- Hook after sign is not Path B
- Silent fail-open without logging is not evidence

### 4. Run BLOCK + ALLOW evidence capture (10 min)
Operator: Partner

Two forced paths: (1) refuse fixture / known-bad merchant → BLOCK with signer=0; (2) known-good allow path → ALLOW with normal sign. Capture both using the checklist below.

Expected:
- BLOCK transcript with signer_invocation_count=0
- ALLOW path still works (gate is not a permanent outage)
- Logs include attributable payer / install seat id

### 5. Confirm Live Board / health lineage (5 min)
Operator: You

File the Path B artifact in the registry (`path-b-artifacts.json`). Buyer AutoGate does **not** increment `day0.gate_evals`. Document artifact id + optional settle-rail snapshot labeled non-Path-B.

Expected:
- Artifact filed with timestamp; settle-rail counters optional and labeled non-Path-B
- Artifact stored with partner codename + date (no secrets)

### 6. Lock next seat + founder-post gate (5 min)
Operator: You

Sequence is locked: Seat 1 → Seat 2 → Seat 3. Do not expand the 10-target list until one external artifact exists. Founder post only after step 5 artifact is real.

Expected:
- Next partner on the locked sequence scheduled
- Artifact file path / gist / transcript linked on board notes

## Evidence checklist (BLOCK / ALLOW)

| ID | Decision | Capture | Pass if |
|---|---|---|---|
| e-block-signer | BLOCK | Refuse before sign: Full refuse eval stdout or gate evaluate() JSON for a forced BLOCK path (refuse fixture / known-bad merchant). | signer_invocation_count=0 AND payment_retry_count=0 AND decision=BLOCK (or equivalent refuse action). |
| e-block-reason | BLOCK | Machine-readable reason: decision.reason / code / rule id from gate output. | Stable string or code a partner can grep in logs. |
| e-allow | ALLOW | Happy path still pays: One ALLOW evaluate() result on a known-good intent (sandbox or mainnet as agreed). | decision=ALLOW and existing sign path proceeds once. |
| e-preflight-log | BOTH | Preflight logged: Log line showing free preflight (ReadinessCard / preflight id) before evaluate completes. | Preflight id or card hash present in session log for both paths. |
| e-lineage | BOTH | Attributable payer lineage: Install seat id / partner codename / agent id + timestamp. Not a TWZRD-owned laptop alone. | External operator identity is explicit; can be tied to Path B artifact registry entry. |
| e-board | BOTH | Live Board snapshot: path_b_artifacts_external + free_card_hits_external (advisory). Optionally note day0.gate_evals labeled settle-rail only. | Numbers recorded; if lag, artifact still filed with timestamp and follow-up check. |

## Partner sequence (locked)

1. **Seat 1** — First external seat — design partner operator. Goal: Complete cold refuse + wire hook in shadow or enforce; capture BLOCK artifact.. Success: Artifact filed; artifact schema + registry path understood; white-glove notes for install friction.
2. **Seat 2** — Second external seat — buyer pipeline integration. Goal: Partner runs refuse binary themselves; at least one BLOCK with signer=0 on their stack.. Success: Second artifact; runbook edits if friction differs from Seat 1.
3. **Seat 3** — Third external seat — framework / embed adjacency. Goal: Install path stable enough to reference publicly; optional embed docs next.. Success: ≥1 public-safe sanitized transcript; Path B artifact story is external, not internal swarm.

## Artifact

Founder recap / announcement only after at least one external artifact exists. Enrollment-without-artifact is not the post.

```json
{
  "schema": "twzrd.path_b_artifact/v1",
  "partner_codename": "Seat 1",
  "date_iso": "2026-08-12",
  "machine_note": "partner macbook — external",
  "gate_package_version": "0.8.14",
  "block": {
    "decision": "BLOCK",
    "signer_invocation_count": 0,
    "payment_retry_count": 0,
    "reason": "…"
  },
  "allow": {
    "decision": "ALLOW",
    "note": "known-good merchant path"
  },
  "health_before": {
    "gate_evals": 0,
    "gate_blocks": 0
  },
  "health_after": {
    "gate_evals": 1,
    "gate_blocks": 1
  },
  "friction": []
}
```


## First external seat — white-glove kit

Session pack: [`public-machine/first-seat-kit/`](./first-seat-kit/) — cold verify, matched-pair snippet, artifact template, friction log.
