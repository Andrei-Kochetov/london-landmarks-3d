// Remove big flat ground planes (e.g. the satellite photo under 3D Warehouse buildings).
// Usage: node drop_ground.mjs in.glb out.glb [minArea=5000]
import { NodeIO, getBounds } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { prune } from "@gltf-transform/functions";

const [, , input, output, minArea = "5000"] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);
let n = 0;
for (const node of doc.getRoot().listNodes()) {
  if (!node.getMesh()) continue;
  const b = getBounds(node), s = b.max.map((v, i) => v - b.min[i]);
  if (s[1] < 0.05 && s[0] * s[2] > +minArea) { node.dispose(); n++; }
}
await doc.transform(prune());
await io.write(output, doc);
console.log("removed", n, "ground plane(s)");
