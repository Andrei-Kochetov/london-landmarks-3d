// Shared helpers for the model-cutting scripts: read a .glb, keep only some triangles, write it back.
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { prune, flatten, dequantize } from "@gltf-transform/functions";

export async function readFlat(path) {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(path);
  await doc.transform(dequantize(), flatten());
  return { io, doc };
}

// world-space position of vertex i of a primitive
export function worldPos(node, pos, i, el = []) {
  const p = pos.getElement(i, el), m = node.getWorldMatrix();
  return [0, 1, 2].map((k) => m[k] * p[0] + m[4 + k] * p[1] + m[8 + k] * p[2] + m[12 + k]);
}

export function primitives(doc) {
  const out = [];
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (mesh) for (const prim of mesh.listPrimitives()) out.push({ node, prim });
  }
  return out;
}

// keep triangles whose centre passes keep([x, y, z]); unused vertices are removed too,
// so the bounding box (and the viewer's framing) shrinks to what is left
export async function keepTriangles(io, doc, keep, output) {
  let kept = 0, dropped = 0;
  for (const { node, prim } of primitives(doc)) {
    const pos = prim.getAttribute("POSITION"), idx = prim.getIndices();
    const tri = idx ? idx.getArray() : Uint32Array.from({ length: pos.getCount() }, (_, i) => i);
    const out = [], a = [], b = [], c = [];
    for (let t = 0; t < tri.length; t += 3) {
      const p0 = worldPos(node, pos, tri[t], a), p1 = worldPos(node, pos, tri[t + 1], b), p2 = worldPos(node, pos, tri[t + 2], c);
      if (keep([0, 1, 2].map((k) => (p0[k] + p1[k] + p2[k]) / 3))) { out.push(tri[t], tri[t + 1], tri[t + 2]); kept++; } else dropped++;
    }
    if (!out.length) { prim.dispose(); continue; }
    const remap = new Map(), order = [];
    const newIdx = out.map((v) => { if (!remap.has(v)) { remap.set(v, order.length); order.push(v); } return remap.get(v); });
    for (const sem of prim.listSemantics()) {
      const att = prim.getAttribute(sem), size = att.getElementSize(), src = att.getArray();
      const dst = new src.constructor(order.length * size);
      order.forEach((v, i) => { for (let k = 0; k < size; k++) dst[i * size + k] = src[v * size + k]; });
      prim.setAttribute(sem, doc.createAccessor().setType(att.getType()).setArray(dst).setNormalized(att.getNormalized()));
    }
    prim.setIndices(doc.createAccessor().setType("SCALAR").setArray(order.length > 65535 ? Uint32Array.from(newIdx) : Uint16Array.from(newIdx)));
  }
  for (const m of doc.getRoot().listMeshes()) if (!m.listPrimitives().length) m.dispose();
  await doc.transform(prune());
  await io.write(output, doc);
  return { kept, dropped };
}
