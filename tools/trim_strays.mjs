// Remove stray fragments far from the building: keep the box that holds most vertices
// (percentiles lowP..highP on each axis, plus a margin), drop triangles outside it.
// Usage: node trim_strays.mjs in.glb out.glb [lowP=3] [highP=97] [margin=0.15]
import { readFlat, keepTriangles, primitives, worldPos } from "./mesh_utils.mjs";

const [, , input, output, lowP = "3", highP = "97", marginArg = "0.15"] = process.argv;
const { io, doc } = await readFlat(input);
const xs = [[], [], []], el = [];
for (const { node, prim } of primitives(doc)) {
  const pos = prim.getAttribute("POSITION");
  for (let i = 0; i < pos.getCount(); i++) { const w = worldPos(node, pos, i, el); xs[0].push(w[0]); xs[1].push(w[1]); xs[2].push(w[2]); }
}
const pct = (a, p) => { const s = Float64Array.from(a).sort(); return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]; };
const lo = xs.map((a) => pct(a, +lowP)), hi = xs.map((a) => pct(a, +highP));
const mg = hi.map((h, k) => (h - lo[k]) * +marginArg);
const res = await keepTriangles(io, doc, (c) => c.every((v, k) => v >= lo[k] - mg[k] && v <= hi[k] + mg[k]), output);
console.log(JSON.stringify({ ...res, box: lo.map((v, k) => [+(v - mg[k]).toFixed(2), +(hi[k] + mg[k]).toFixed(2)]) }));
