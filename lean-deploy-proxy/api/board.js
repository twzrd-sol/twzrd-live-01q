function filterMoves(moves, q) {
  return (moves || []).filter((m) => {
    if (q.phase && m.phase !== q.phase) return false;
    if (q.horizon && m.horizon !== q.horizon) return false;
    if (q.impact && m.impact !== q.impact) return false;
    return true;
  });
}

function parseDone(raw) {
  if (!raw) return new Set();
  return new Set(
    String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function rankNext(moves, done) {
  const hOrder = { this_week: 0, this_month: 1, quarter: 2 };
  const iOrder = { critical: 3, high: 2, medium: 1 };
  return moves
    .filter((m) => !done.has(m.id) && !m.done)
    .slice()
    .sort((a, b) => {
      const hd = (hOrder[a.horizon] ?? 9) - (hOrder[b.horizon] ?? 9);
      if (hd !== 0) return hd;
      return (iOrder[b.impact] ?? 0) - (iOrder[a.impact] ?? 0);
    })
    .slice(0, 5);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, accept");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const url = new URL(req.url, "http://x");
    const q = {
      phase: url.searchParams.get("phase") || undefined,
      horizon: url.searchParams.get("horizon") || undefined,
      impact: url.searchParams.get("impact") || undefined,
    };
    const done = parseDone(url.searchParams.get("done"));

    const r = await fetch(
      "https://cdn.jsdelivr.net/gh/twzrd-sol/twzrd-live-01q@3616cf9532fe749a6b0775e336342434e08d7f31/public-machine/board.json",
      { cache: "no-store" },
    );
    const board = await r.json();

    try {
      const s = await fetch(
        "https://cdn.jsdelivr.net/gh/twzrd-sol/sprat-brief@main/sprat.json",
        { cache: "no-store" },
      );
      if (s.ok && board.cf_strategy) {
        const sprat = await s.json();
        board.cf_strategy.source_schema_version =
          sprat.schema_version || board.cf_strategy.source_schema_version;
        board.cf_strategy.source_role = sprat.role || "source_extract";
        board.cf_strategy.live_source = true;
        board.cf_strategy.fetched_at = new Date().toISOString();
        board.cf_strategy.source =
          "https://cdn.jsdelivr.net/gh/twzrd-sol/sprat-brief@main/sprat.json";
        if (sprat.thesis) board.cf_strategy.thesis = sprat.thesis;
        if (sprat.posture) board.cf_strategy.posture = sprat.posture;
        if (sprat.decision_2026_08_11) {
          board.cf_strategy.decision = board.cf_strategy.decision || {};
          board.cf_strategy.decision.pick =
            sprat.decision_2026_08_11.pick || board.cf_strategy.decision.pick;
          board.cf_strategy.decision.summary =
            sprat.decision_2026_08_11.summary ||
            board.cf_strategy.decision.summary;
        }
      }
    } catch (e) {}

    try {
      const h = await fetch("https://intel.twzrd.xyz/health", {
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      if (h.ok) {
        const health = await h.json();
        const day0 = health.day0 || {};
        const funnel = {
          external_cards: day0.free_card_hits_external || 0,
          gate_evals: day0.gate_evals || 0,
          gate_blocks: day0.gate_blocks || 0,
          paid_external: day0.paid_trust_payer_external || 0,
        };
        let diagnosis =
          (board.live && board.live.diagnosis) ||
          "Infra live; check funnel for demand.";
        if (funnel.gate_evals === 0 && funnel.external_cards > 0) {
          diagnosis =
            "Advisory demand exists without enforcement. External free cards are happening; Path B still has no external refuse artifact (buyer gate). day0.gate_evals is settle-gate context — not Path B proof alone.";
        } else if (funnel.gate_evals === 0 && funnel.external_cards === 0) {
          diagnosis =
            "Infra is live; demand is not. Zero external free cards and no external Path B artifact yet.";
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
          },
          day0,
          funnel,
          diagnosis,
        };
        board.generated_at = new Date().toISOString();
      }
    } catch (e) {}

    // Apply done flags + next_actions recompute
    if (Array.isArray(board.moves)) {
      board.moves = board.moves.map((m) => ({
        ...m,
        done: done.has(m.id) || !!m.done,
      }));
      board.next_actions = rankNext(board.moves, done);
      if (q.phase || q.horizon || q.impact) {
        board.moves = filterMoves(board.moves, q);
        board.filters_applied = q;
      }
    }

    res.setHeader("content-type", "application/json; charset=utf-8");
    res.status(200).send(JSON.stringify(board, null, 2));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
