#!/usr/bin/env bash
# Path B cold verify — run on partner machine (external seat).
# Does NOT close path_b_artifacts (self-serve dogfood unless operator files artifact).
set -euo pipefail
echo "=== Path B cold verify (twzrd-x402-gate@0.8.14) ==="
npm i twzrd-x402-gate@0.8.14 x402-solana@2.1.0 @x402/core @x402/fetch @x402/svm @solana/kit @scure/base
node node_modules/twzrd-x402-gate/bin/twzrd-gate-eval-refuse.js
echo "=== Expect: twzrd_decision=block, signer_invocation_count=0, verified=true ==="
echo "=== Reminder: closes_external_adoption_metric=false until path_b_artifact filed ==="
