import { fetchMachineText } from "../lib/http.mjs";

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
      const r = await fetchMachineText("path-b.md");
      res.setHeader("content-type", "text/markdown; charset=utf-8");
      return res.status(r.status).send(r.text);
    }
    const r = await fetchMachineText("path-b.json");
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.status(r.status).send(r.text);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
