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
const RETIRED_INTEL_SHA = "07281cb";
const PINNED_SHA = "89d160a24f8ff4a5129588961fc1f08529fe4321";
const MACHINE_BASES = [
  `https://cdn.jsdelivr.net/gh/twzrd-sol/twzrd-live-01q@${PINNED_SHA}/public-machine`,
  `https://raw.githubusercontent.com/twzrd-sol/twzrd-live-01q/${PINNED_SHA}/public-machine`,
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
      const staleCopy =
        text.includes(RETIRED_HOST) ||
        (name === "board.json" &&
          text.includes(RETIRED_INTEL_SHA) &&
          text.includes("Ship 07281cb"));
      if (!staleCopy) return { status: r.status, text };
      stale = stale || { status: r.status, text };
    } catch (e) {
      lastErr = e;
    }
  }
  if (stale) return stale;
  throw lastErr || new Error(`failed to load ${name}`);
}
