#!/usr/bin/env node
/**
 * Validate a filled twzrd.path_b_artifact/v1 (or a registry that embeds one).
 * Does not invent evidence — only checks honesty/schema constraints.
 *
 *   node public-machine/first-seat-kit/validate-artifact.mjs <artifact.json>
 */
import { readFileSync } from "node:fs";

const RETIRED_HOST = "twzrd-live-01q-host.vercel.app";
const PLACEHOLDER = /REPLACE_|example_signature|deadbeef|0{16,}/i;
const OPERATOR_TYPES = new Set([
  "external_partner",
  "operator_controlled",
]);

function fail(msg) {
  console.error(`INVALID: ${msg}`);
  process.exit(1);
}

function asArtifact(raw) {
  if (raw?.schema === "twzrd.path_b_artifact/v1") return raw;
  if (raw?.schema === "twzrd.path_b_artifact_registry/v1") {
    if (!Array.isArray(raw.artifacts) || raw.artifacts.length < 1) {
      fail("registry has no artifacts[]");
    }
    const first = raw.artifacts.find((a) => a?.schema === "twzrd.path_b_artifact/v1");
    if (!first) fail("registry artifacts[] has no twzrd.path_b_artifact/v1");
    return first;
  }
  fail(`unknown schema ${raw?.schema}`);
}

const path = process.argv[2];
if (!path) fail("usage: validate-artifact.mjs <file.json>");

const raw = JSON.parse(readFileSync(path, "utf8"));
const text = JSON.stringify(raw);
if (text.includes(RETIRED_HOST)) fail("mentions retired host twzrd-live-01q-host.vercel.app");
if (PLACEHOLDER.test(text)) fail("placeholder / invented-looking token still present");

if (raw.schema === "twzrd.path_b_artifact_registry/v1") {
  const c = raw.counts || {};
  if (typeof c.external_artifacts !== "number") fail("registry counts.external_artifacts missing");
  if ((raw.artifacts || []).length === 0 && c.external_artifacts > 0) {
    fail("external_artifacts > 0 but artifacts[] is empty");
  }
}

const a = asArtifact(raw);
if (a.schema !== "twzrd.path_b_artifact/v1") fail("artifact schema");

const md = a.metadata || {};
for (const k of [
  "partner_codename",
  "integration",
  "operator_type",
  "machine_note",
  "gate_package_version",
  "captured_at",
]) {
  if (!md[k] || String(md[k]).startsWith("REPLACE")) fail(`metadata.${k}`);
}
if (!OPERATOR_TYPES.has(md.operator_type)) {
  fail(`operator_type must be one of ${[...OPERATOR_TYPES].join("|")}`);
}
if (md.gate_package_version !== "0.9.7") fail("gate_package_version must be 0.9.7 for this kit pin");

const block = a.arm_block || {};
if (String(block.decision).toLowerCase() !== "block") fail("arm_block.decision");
if (block.signer_invocation_count !== 0) fail("arm_block.signer_invocation_count must be 0");
if (block.payment_retry_count !== 0) fail("arm_block.payment_retry_count must be 0");
if (block.tx_signature != null) fail("arm_block.tx_signature must be null");
if (!block.reason || !block.run_id) fail("arm_block.reason / run_id");

const allow = a.arm_allow || {};
if (!allow.run_id) fail("arm_allow.run_id");
if (allow.tx_signature != null) {
  if (typeof allow.tx_signature !== "string" || allow.tx_signature.length < 64) {
    fail("arm_allow.tx_signature is not a real signature (leave null if not run)");
  }
}
if (allow.tx_signature == null && allow.signer_invocation_count !== 0) {
  fail("unsigned ALLOW arm must report signer_invocation_count=0");
}

const v = a.verification || {};
for (const k of [
  "valid_matched_pair",
  "external_attribution_confirmed",
  "closes_external_adoption_metric",
]) {
  if (typeof v[k] !== "boolean") fail(`verification.${k} must be boolean`);
}
if (md.operator_type !== "external_partner" && v.external_attribution_confirmed) {
  fail("external_attribution_confirmed cannot be true for a non-external operator_type");
}
if (String(md.machine_note).toLowerCase().includes("dogfood")) {
  fail("machine_note describes dogfood — do not file as a Path B artifact");
}

console.log(
  JSON.stringify(
    {
      ok: true,
      schema: a.schema,
      operator_type: md.operator_type,
      block_signer: block.signer_invocation_count,
      allow_tx: allow.tx_signature,
      verification: v,
    },
    null,
    2,
  ),
);
