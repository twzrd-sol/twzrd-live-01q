/**
 * Vicky seat — matched BLOCK + ALLOW sketch for PayAI x402-solana + twzrd-x402-gate.
 *
 * Public APIs (verified against twzrd-x402-gate@0.8.14):
 *   createTwzrdBeforePaymentHook from "twzrd-x402-gate"
 *   createX402Client from "x402-solana" (beforePayment seat)
 *
 * Replace wallet with the operator's real signer.
 * ALLOW arm spends real USDC on mainnet — only with partner consent.
 * Do NOT invent tx signatures; copy from settlement headers / explorer.
 */
import { createX402Client } from "x402-solana";
import { createTwzrdBeforePaymentHook } from "twzrd-x402-gate";
// import operator wallet type from your stack (e.g. @solana/web3.js Keypair / wallet adapter)

const integration = "vicky-agent-client";
const BLOCK_URL =
  process.env.PATH_B_BLOCK_URL ?? "https://intel.twzrd.xyz/v1/intel/refuse-fixture";
const ALLOW_URL =
  process.env.PATH_B_ALLOW_URL ??
  "https://x402-solana-starter.fp4b5ksccw.workers.dev/report";

export type ArmResult = {
  integration: string;
  runId: string;
  arm: "block" | "allow";
  signerInvocations: number;
  decision?: string;
  status?: number;
  settlementHeader?: string | null;
  error?: string;
};

/** Count signTransaction / signAndSendTransaction calls (adjust to wallet shape). */
export function instrumentSigner<T extends object>(wallet: T): {
  wallet: T;
  getSignerInvocations: () => number;
  reset: () => void;
} {
  let signerInvocations = 0;
  const walletProxy = new Proxy(wallet, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (
        (prop === "signTransaction" ||
          prop === "signAndSendTransaction" ||
          prop === "signAllTransactions") &&
        typeof val === "function"
      ) {
        return async (...args: unknown[]) => {
          signerInvocations += 1;
          return (val as (...a: unknown[]) => unknown).apply(target, args);
        };
      }
      return typeof val === "function" ? (val as Function).bind(target) : val;
    },
  }) as T;
  return {
    wallet: walletProxy,
    getSignerInvocations: () => signerInvocations,
    reset: () => {
      signerInvocations = 0;
    },
  };
}

export async function runBlockArm(rawWallet: object): Promise<ArmResult> {
  const runId = crypto.randomUUID();
  const { wallet, getSignerInvocations, reset } = instrumentSigner(rawWallet);
  reset();
  const client = createX402Client({
    // @ts-expect-error — wallet type is operator-specific
    wallet,
    network: "solana",
    beforePayment: createTwzrdBeforePaymentHook({
      refuseWashFlagged: true,
      failOpen: false,
      attribution: { integration, runId },
    }),
  });
  try {
    await client.fetch(BLOCK_URL);
    return {
      integration,
      runId,
      arm: "block",
      signerInvocations: getSignerInvocations(),
      error: "expected refuse, got success",
    };
  } catch (err) {
    return {
      integration,
      runId,
      arm: "block",
      signerInvocations: getSignerInvocations(), // MUST be 0
      decision: "block",
      error: String(err),
    };
  }
}

export async function runAllowArm(rawWallet: object): Promise<ArmResult> {
  const runId = crypto.randomUUID();
  const { wallet, getSignerInvocations, reset } = instrumentSigner(rawWallet);
  reset();
  const client = createX402Client({
    // @ts-expect-error — wallet type is operator-specific
    wallet,
    network: "solana",
    beforePayment: createTwzrdBeforePaymentHook({
      refuseWashFlagged: true,
      failOpen: false,
      attribution: { integration, runId },
    }),
  });
  const res = await client.fetch(ALLOW_URL);
  return {
    integration,
    runId,
    arm: "allow",
    signerInvocations: getSignerInvocations(), // typically >= 1 if payment path ran
    status: res.status,
    settlementHeader:
      res.headers.get("payment-response") ||
      res.headers.get("PAYMENT-RESPONSE") ||
      res.headers.get("x-payment-response"),
  };
}
