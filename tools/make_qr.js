// QR codes for the website and for each sight's section (#id anchors).
// Usage: node make_qr.js ../QR_codes
import QR from "qrcode";
import path from "node:path";

const out = process.argv[2] || "../QR_codes";
const base = "https://london-landmarks-7v.netlify.app/";
const ids = ["palace", "tower", "bigben", "eye", "opera", "square", "abbey", "gallery"];
const items = { site: base, ...Object.fromEntries(ids.map((id) => [id, base + "#" + id])) };
for (const [k, url] of Object.entries(items)) {
  await QR.toFile(path.join(out, "qr_" + k + ".png"), url, { errorCorrectionLevel: "M", margin: 1, width: 720, color: { dark: "#14203B", light: "#FFFFFF" } });
  console.log(k, url);
}
