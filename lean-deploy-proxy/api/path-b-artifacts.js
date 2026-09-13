const ORIGINS = [
  // Prefer raw GitHub main so the live count moves after merge without waiting on a jsDelivr POP.
  "https://raw.githubusercontent.com/twzrd-sol/twzrd-live-01q/main/public-machine/path-b-artifacts.json",
  "https://cdn.jsdelivr.net/gh/twzrd-sol/twzrd-live-01q@main/public-machine/path-b-artifacts.json",
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, accept");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  let lastErr = null;
  for (const url of ORIGINS) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) {
        lastErr = new Error(`${url} ${r.status}`);
        continue;
      }
      res.setHeader("content-type", "application/json; charset=utf-8");
      return res.status(r.status).send(await r.text());
    } catch (e) {
      lastErr = e;
    }
  }
  res.status(500).json({ error: String(lastErr) });
}
