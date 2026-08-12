export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, accept");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const url = new URL(req.url, "http://x");
    const format = (url.searchParams.get("format") || "json").toLowerCase();
    if (format === "md" || format === "markdown" || format === "txt") {
      const r = await fetch(
        "https://raw.githubusercontent.com/twzrd-sol/twzrd-live-01q/main/public-machine/path-b.md",
        { cache: "no-store" },
      );
      res.setHeader("content-type", "text/markdown; charset=utf-8");
      return res.status(r.status).send(await r.text());
    }
    const r = await fetch(
      "https://raw.githubusercontent.com/twzrd-sol/twzrd-live-01q/main/public-machine/path-b.json",
      { cache: "no-store" },
    );
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.status(r.status).send(await r.text());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
