export function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, accept");
  res.setHeader("Cache-Control", "no-store");
}
export function originFromReq(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  if (host) return `${proto}://${host}`;
  return "https://twzrd-01q-board.vercel.app";
}

const RETIRED_HOST = "twzrd-live-01q-host.vercel.app";
const MACHINE_BASES = [
  "https://cdn.jsdelivr.net/gh/twzrd-sol/twzrd-live-01q@b494b1302de628011e76ec98e525c00126434530/public-machine",
  "https://raw.githubusercontent.com/twzrd-sol/twzrd-live-01q/b494b1302de628011e76ec98e525c00126434530/public-machine",
  "https://cdn.jsdelivr.net/gh/twzrd-sol/twzrd-live-01q@main/public-machine",
  "https://raw.githubusercontent.com/twzrd-sol/twzrd-live-01q/main/public-machine",
];

export async function fetchMachineText(name) {
  let stale = null;
  let lastErr = null;
  for (const base of MACHINE_BASES) {
    try {
      const r = await fetch(`${base}/${name}`, { cache: "no-store" });
      if (!r.ok) {
        lastErr = new Error(`${name} ${r.status} from ${base}`);
        continue;
      }
      const text = await r.text();
      if (!text.includes(RETIRED_HOST)) return { status: r.status, text };
      stale = stale || { status: r.status, text };
    } catch (e) {
      lastErr = e;
    }
  }
  if (stale) return stale;
  throw lastErr || new Error(`failed to load ${name}`);
}
