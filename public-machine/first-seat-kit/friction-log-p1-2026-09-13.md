### External Seat Onboarding Session Friction Log

* **Timestamp:** 2026-09-13
* **Operator / org:** P1-operator-seat (operator-controlled Cursor Cloud Agent; not an independent partner)
* **Machine note:** Cursor Cloud Agent VM, hostname `cursor`, Node v22.14.0 — operator-dispatched first-seat-kit, not a partner laptop
* **gate package version:** 0.9.7 (x402-solana@3.0.0)
* **Peer dependencies encountered:** `@x402/core`, `@x402/fetch`, `@x402/svm`, `@solana/kit`, `@scure/base`, `x402-solana@3.0.0`. npm warned `uuid@8.3.2` deprecated.
* **Time to first refuse decision:** ~14 seconds (COLD_VERIFY.sh, including npm i)
* **Cold verify exit:** OK — `twzrd_decision=block`, `signer_invocation_count=0`, `payment_retry_count=0`, `verified=true`
* **Friction Point 1:** Kit ALLOW URL (`x402-solana-starter.../report`) returns `{}` in the JSON body. `accepts[]` is only on the `PAYMENT-REQUIRED` header. MCP `evaluate_x402_resource` reported "402 response has no accepts array" until the header was base64-decoded.
* **Friction Point 2:** No env-gated operator wallet or USDC in this environment. ALLOW settlement was skipped; `tx_signature` left null.
* **RPC / egress issues:** none on intel.twzrd.xyz or the kit ALLOW URL
* **Hook wiring notes:** `createTwzrdBeforePaymentHook` + `evaluateBeforePaymentCreation` ran without a signer. Result: `abort=false`, `approved=true`, `verdict=warn`, `reason=twzrd_warn_allowed`, `policyAction=allow`. Official `POST /v1/intel/preflight` `preflight_id=656381`.
* **ALLOW arm run?** evaluate yes / settlement no — wallet not funded
* **Operator feedback (quote):** n/a — operator-controlled packet run, no partner on the call
* **Runbook edit required before the next seat?** yes — document that v2 402 challenges may put `accepts` only on `PAYMENT-REQUIRED`, and that ALLOW `tx_signature: null` is the honest no-wallet outcome
