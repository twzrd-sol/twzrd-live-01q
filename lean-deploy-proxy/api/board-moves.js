function filterMoves(moves, q) {
  return (moves || []).filter((m) => {
    if (q.phase && m.phase !== q.phase) return false;
    if (q.horizon && m.horizon !== q.horizon) return false;
    if (q.impact && m.impact !== q.impact) return false;
    return true;
  });
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
    const r = await fetch(
      "https://cdn.jsdelivr.net/gh/twzrd-sol/twzrd-live-01q@2d7ca2bbb71c4ed158e71f988bc003b54e5f1c41/public-machine/moves.json",
      { cache: "no-store" },
    );
    const body = await r.json();
    let moves = Array.isArray(body) ? body : body.moves || [];
    if (q.phase || q.horizon || q.impact) {
      moves = filterMoves(moves, q);
    }
    const out = Array.isArray(body)
      ? moves
      : { ...body, count: moves.length, filters_applied: q, moves };
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.status(200).send(JSON.stringify(out, null, 2));
  } catch (e) {
    res.status(500).send(String(e));
  }
}
