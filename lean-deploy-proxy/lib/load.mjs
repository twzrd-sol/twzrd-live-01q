const RAW_BASE = "https://cdn.jsdelivr.net/gh/twzrd-sol/twzrd-live-01q@f04821923c4da2934562f4b36c2dcda0fe88adca/public-machine";
const SPRAT_URLS = [
  "https://cdn.jsdelivr.net/gh/twzrd-sol/sprat-brief@main/sprat.json",
  "https://raw.githubusercontent.com/twzrd-sol/sprat-brief/main/sprat.json",
];

async function loadArtifactRegistry() {
  try {
    const r = await fetch(`${RAW_BASE}/path-b-artifacts.json`, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export async function loadBoardJson() {
  const r = await fetch(`${RAW_BASE}/board.json`, { cache: "no-store" });
  if (!r.ok) throw new Error(`board.json ${r.status}`);
  const board = await r.json();

  const artifacts = await loadArtifactRegistry();
  const pathBExternal = artifacts?.counts?.external_artifacts ?? 0;

  // Live intel health
  try {
    const h = await fetch("https://intel.twzrd.xyz/health", {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (h.ok) {
      const health = await h.json();
      const day0 = health.day0 || {};
      // Honest funnel: Path B primary is artifacts, not day0.gate_evals
      const funnel = {
        external_cards: day0.free_card_hits_external ?? 0,
        path_b_artifacts: pathBExternal,
        settle_gate_evals: day0.gate_evals ?? 0,
        settle_gate_blocks: day0.gate_blocks ?? 0,
        paid_external: day0.paid_trust_payer_external ?? 0,
        // legacy aliases (deprecated) — do not treat as Path B primary
        gate_evals: day0.gate_evals ?? 0,
        gate_blocks: day0.gate_blocks ?? 0,
      };
      const stage = (key, v) => {
        if (key === "external_cards") return v <= 0 ? "empty" : v < 50 ? "thin" : v < 500 ? "moving" : "healthy";
        if (key === "path_b_artifacts") return v <= 0 ? "empty" : v < 3 ? "thin" : v < 20 ? "moving" : "healthy";
        if (key === "settle_gate_evals" || key === "settle_gate_blocks")
          return v <= 0 ? "empty" : v < 10 ? "thin" : v < 100 ? "moving" : "healthy";
        return v <= 0 ? "empty" : v < 5 ? "thin" : v < 50 ? "moving" : "healthy";
      };

      let diagnosis = board.live?.diagnosis || "";
      if (funnel.path_b_artifacts === 0 && funnel.external_cards > 0) {
        diagnosis =
          "Advisory demand exists without external Path B seats. Free cards are happening; no attributable external refuse/allow artifact is filed yet. Lead with refuse-before-sign. Do not chase day0.gate_evals — that is settle-rail telemetry, not buyer AutoGate.";
      } else if (funnel.path_b_artifacts === 0 && funnel.external_cards === 0) {
        diagnosis =
          "Infra is live; external Path B seats are not. Zero external free cards and zero Path B artifacts. day0.gate_evals is settle-rail only and is not the Path B adoption counter.";
      } else if (funnel.path_b_artifacts > 0) {
        diagnosis =
          "External Path B artifacts exist in the registry. Free cards remain advisory; day0.gate_evals remains settle-rail telemetry.";
      }

      board.live = {
        ok: true,
        fetched_at: new Date().toISOString(),
        health: {
          status: health.status,
          package_version: health.package_version,
          network: health.network,
          mode: health.mode,
          settle_gate_enforcing: health.settle_gate_enforcing,
          settle_gate_shadow: health.settle_gate_shadow,
          service_catalog: health.service_catalog,
        },
        day0,
        funnel,
        funnel_status: {
          external_cards: stage("external_cards", funnel.external_cards),
          path_b_artifacts: stage("path_b_artifacts", funnel.path_b_artifacts),
          settle_gate_evals: stage("settle_gate_evals", funnel.settle_gate_evals),
          settle_gate_blocks: stage("settle_gate_blocks", funnel.settle_gate_blocks),
          paid_external: stage("paid_external", funnel.paid_external),
        },
        funnel_doctrine: {
          primary: "path_b_artifacts",
          primary_source: "public-machine/path-b-artifacts.json",
          not_path_b: ["settle_gate_evals", "settle_gate_blocks", "day0.gate_evals", "day0.gate_blocks"],
          advisory: ["external_cards"],
        },
        path_b_artifacts: {
          external: pathBExternal,
          registry_counts: artifacts?.counts || null,
        },
        diagnosis,
      };
      board.generated_at = new Date().toISOString();
    }
  } catch (e) {
    board.live = {
      ...(board.live || {}),
      ok: false,
      error: String(e),
      fetched_at: new Date().toISOString(),
      path_b_artifacts: { external: pathBExternal },
    };
  }

  // Refresh cf_strategy from live SPRAT (jsDelivr first — raw CDN may lag)
  let spratHit = null;
  for (const url of SPRAT_URLS) {
    try {
      const s = await fetch(url, { cache: "no-store" });
      if (s.ok) {
        spratHit = { sprat: await s.json(), url };
        break;
      }
    } catch {
      // try next
    }
  }
  if (spratHit && board.cf_strategy) {
    const { sprat, url } = spratHit;
    board.cf_strategy = {
      ...board.cf_strategy,
      source: url,
      source_schema_version: sprat.schema_version || board.cf_strategy.source_schema_version,
      source_role: sprat.role || sprat.provenance?.role || board.cf_strategy.source_role || "source_extract",
      source_generated_at: sprat.generated_at,
      thesis: sprat.thesis || board.cf_strategy.thesis,
      decision: {
        ...board.cf_strategy.decision,
        summary: sprat.decision_2026_08_11?.summary || board.cf_strategy.decision?.summary,
        pick: sprat.decision_2026_08_11?.pick || board.cf_strategy.decision?.pick,
        ship_now: sprat.decision_2026_08_11?.ship_now || board.cf_strategy.decision?.ship_now,
        do_not: sprat.decision_2026_08_11?.do_not || board.cf_strategy.decision?.do_not,
      },
      supply_lanes: sprat.supply_lanes || board.cf_strategy.supply_lanes,
      posture: sprat.posture || board.cf_strategy.posture,
      signals: board.cf_strategy.signals,
      live_source: true,
      fetched_at: new Date().toISOString(),
    };
    if (sprat.signals?.A) {
      board.cf_strategy.signals.A = {
        ...board.cf_strategy.signals.A,
        id: sprat.signals.A.id,
        status: sprat.signals.A.status,
        fires_when: sprat.signals.A.fires_when,
      };
    }
    if (sprat.signals?.B) {
      board.cf_strategy.signals.B = {
        ...board.cf_strategy.signals.B,
        id: sprat.signals.B.id,
        status: sprat.signals.B.status,
        fires_when: sprat.signals.B.fires_when,
        probe: sprat.signals.B.probe,
        probe_hint: sprat.signals.B.probe_hint,
        related_issues: sprat.signals.B.related_issues,
      };
    }
  } else if (board.cf_strategy) {
    board.cf_strategy.live_source = false;
    board.cf_strategy.fetched_at = new Date().toISOString();
  }
  return board;
}

export function compactCf(cf) {
  if (!cf) return null;
  return {
    schema: cf.schema,
    source_schema_version: cf.source_schema_version,
    source_role: cf.source_role,
    live_source: cf.live_source,
    pick: cf.decision?.pick,
    thesis: cf.thesis?.headline,
    decision_summary: cf.decision?.summary,
    ship_now: cf.posture?.ship_now,
    hold: cf.posture?.hold,
    ready_not_shipped: cf.posture?.ready_not_shipped,
    guardrail: cf.posture?.guardrail,
    signals: {
      A: { id: cf.signals?.A?.id, status: cf.signals?.A?.status },
      B: { id: cf.signals?.B?.id, status: cf.signals?.B?.status },
    },
    not_this_board: cf.not_this_board,
  };
}

export async function loadRaw(name) {
  const r = await fetch(`${RAW_BASE}/${name}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`${name} ${r.status}`);
  return r.text();
}
