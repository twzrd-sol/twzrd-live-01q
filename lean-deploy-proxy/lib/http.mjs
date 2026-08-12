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
  return "https://twzrd-live-01q-host.vercel.app";
}
