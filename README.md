# TWZRD Live 0→1Q

Operator board: get [intel.twzrd.xyz](https://intel.twzrd.xyz) from **live infra → live demand** in Q1.

## Public machine host (for other AIs)

**Canonical GitHub:** [twzrd-sol/twzrd-live-01q](https://github.com/twzrd-sol/twzrd-live-01q)

**Host:** https://twzrd-live-01q-host.vercel.app

| Path | Purpose |
|---|---|
| `/llms.txt` | Agent start |
| `/api/board` | Full board (`cf_strategy` + `path_b_runbook` + `attestation`) |
| `/api/attestation` | Agent attestation demo JSON |
| `/api/path-b` | Path B external runbook |
| `/api/intel-health` | Proxied intel health |
| `/api/openapi.json` | OpenAPI |

CORS open · no auth · schema `twzrd.live_board/v1` · version **1.3.0**

Pay decisions → https://intel.twzrd.xyz/v1/intel/preflight (not this board).

## GitHub mirrors (twzrd-sol only)

- https://github.com/twzrd-sol/twzrd-live-01q
- https://cdn.jsdelivr.net/gh/twzrd-sol/twzrd-live-01q@main/public-machine/board.json

See [`public-machine/`](./public-machine/) and [`AGENTS-MACHINE.md`](./AGENTS-MACHINE.md).

`grid-kernel` was throwaway — do not use.
