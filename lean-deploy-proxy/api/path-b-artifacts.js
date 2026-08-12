export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, accept");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const r = await fetch(
      "https://cdn.jsdelivr.net/gh/twzrd-sol/twzrd-live-01q@f04821923c4da2934562f4b36c2dcda0fe88adca/public-machine/path-b-artifacts.json",
      { cache: "no-store" },
    );
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.status(r.status).send(await r.text());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
