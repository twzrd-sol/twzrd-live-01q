# Path B External Integration Runbook

schema: `twzrd.path_b_runbook/v1` · v1.0.1

**Claim:** Externally controlled refuse-before-sign: a buyer pipeline that is not ours evaluates and can BLOCK payment before any Solana signer runs.

**North star:** Success = one attributable external buyer refuse transcript (BLOCK with signer_invocation_count=0, payment_retry_count=0) under partner control — filed as twzrd.path_b_artifact/v1. Not free MCP hits. Not internal dogfood.

## Metric semantics (do not conflate)

External Path B artifact: partner-controlled buyer gate run that produces a refuse transcript (signer never called on BLOCK). Schema twzrd.path_b_artifact/v1.

intel day0.gate_evals counts facilitator settle-gate activity, not buyer AutoGate refuse transcripts. Path B proof is the external artifact + lineage, full stop.

| Not primary | Means | Use for |
|---|---|---|
| `day0.gate_evals / gate_blocks / gate_allows` | Facilitator settle-gate evaluations on intel (seller/settlement path). Often shadow; orthogonal to buyer beforePayment refuse. | Ops context only. Do NOT treat a rise in gate_evals alone as Path B external adoption. |
| `free_card_hits_external` | Free preflight / readiness cards hit by external callers (advisory). | Warm demand signal — convert to gate install, not a success metric. |
| `paid_trust_payer_external` | Paid trust / portable proof by external payers. | Secondary conversion after Path B seats exist. |
| `twzrd.gate_eval_refuse.v1 with closes_external_adoption_metric=false` | Internal self-serve / dogfood refuse (our machine). | CI and readiness only — never counts as external Path B. |

**Not this runbook:** Pay decisions → https://intel.twzrd.xyz/v1/intel/preflight. This runbook installs enforcement; it does not authorize spend. Free preflight ≠ product. day0.gate_evals ≠ buyer refuse proof.

## Cold install

```bash
npm i twzrd-x402-gate@0.8.14 x402-solana@2.1.0 @x402/core @x402/fetch @x402/svm @solana/kit @scure/base
node node_modules/twzrd-x402-gate/bin/twzrd-gate-eval-refuse.js
```

Expected: `signer_invocation_count=0 payment_retry_count=0`

## Partner sequence

1. **Vicky** — First external buyer seat. Goal: Cold refuse + wire hook + file artifact. Success: twzrd.path_b_artifact/v1 with external machine_note.
2. **Nick** — Second seat — different client stack. Goal: Repeat evidence checklist on their stack. Success: Second artifact, non-identical environment.
3. **Lucas** — Third seat — distribution-shaped. Goal: Third artifact or documented blocker. Success: Sequence complete or explicit hold with reason.

## Steps

### 1. Prep the seat (before screen-share) (10m)

Confirm partner is an external buyer-side operator (agent client, not our seller worker). Share runbook URL + cold cmd. Do not lead with storefront merch.

Expected:
- Partner has Node 20+ shell
- No expectation of funded wallet for BLOCK proof
- Codename locked (Vicky → Nick → Lucas)

### 2. Cold-machine refuse proof (their shell) (5m)

Partner pastes cold install + refuse eval on a machine we do not control. Capture full stdout.

```bash
npm i twzrd-x402-gate@0.8.14 x402-solana@2.1.0 @x402/core @x402/fetch @x402/svm @solana/kit @scure/base
node node_modules/twzrd-x402-gate/bin/twzrd-gate-eval-refuse.js
```

Expected:
- schema twzrd.gate_eval_refuse.v1
- twzrd_decision=block
- signer_invocation_count=0
- payment_retry_count=0
- usdc_spent=0
- verified=true

### 3. Wire gate into their buyer pipeline (15–30m)

Install beforePayment / AutoGate on their real x402 client path (not only the bin script).

```bash
import { createTwzrdBeforePaymentHook } from "twzrd-x402-gate";
// beforePayment: createTwzrdBeforePaymentHook({ refuseWashFlagged: true })
```

Expected:
- Hook runs after requirement selection, before signTransaction
- BLOCK aborts payload creation

### 4. Run BLOCK + ALLOW evidence capture (15m)

Paired evidence: refuse fixture BLOCK (no signer) then one ALLOW path they trust.

Expected:
- BLOCK transcript with zero signer invocations
- ALLOW still completes once on known-good intent

### 5. Confirm lineage + file artifact (10m)

File twzrd.path_b_artifact/v1 with partner codename, machine note, package version, transcripts, health snapshots. day0.gate_evals may not move — that is OK if artifact is solid.

Expected:
- Artifact complete
- External operator identity explicit
- Not closed solely because day0.gate_evals incremented

### 6. Lock next seat + founder-post gate (5m)

Next codename only after artifact filed. Founder post only after ≥1 external artifact.

Expected:
- Sequence Vicky → Nick → Lucas respected

## Evidence checklist

- **e-block-signer** [BLOCK] Refuse before sign: pass if signer_invocation_count=0 AND payment_retry_count=0 AND decision=BLOCK (or equivalent refuse action).
- **e-block-reason** [BLOCK] Machine-readable reason: pass if Stable string or code a partner can grep in logs.
- **e-allow** [ALLOW] Happy path still pays: pass if decision=ALLOW and existing sign path proceeds once.
- **e-preflight-log** [BOTH] Preflight logged: pass if Preflight id or card hash present in session log for both paths.
- **e-lineage** [BOTH] Attributable payer lineage: pass if External operator identity is explicit; artifact marks external=true.
- **e-board** [BOTH] Health snapshot (context, not sole proof): pass if Numbers recorded for context; Path B success still requires the external refuse artifact even if gate_evals is unchanged.

## Order of ops

- 1. Produce screen-share-ready install runbook (this document).
- 2. Define BLOCK/ALLOW evidence-capture checklist.
- 3. Run with Vicky, then Nick, then Lucas.
- 4. Capture one attributable external artifact (twzrd.path_b_artifact/v1).
- 5. Launch founder post with external proof — not enrollment theater.
