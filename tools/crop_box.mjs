// Cut a scan down to one area: keep triangles whose centre is inside an x/z box (all heights).
// Usage: node crop_box.mjs in.glb out.glb <xMin> <xMax> <zMin> <zMax>
// Coordinates: point at the model in model-viewer and call
//   mv.positionAndNormalFromPoint(clientX, clientY)  (see CLAUDE.md, "Обрезка моделей").
import { readFlat, keepTriangles } from "./mesh_utils.mjs";

const [, , input, output, x0, x1, z0, z1] = process.argv;
if (!z1) { console.error("usage: node crop_box.mjs in.glb out.glb xMin xMax zMin zMax"); process.exit(1); }
const { io, doc } = await readFlat(input);
const res = await keepTriangles(io, doc, (c) => c[0] >= +x0 && c[0] <= +x1 && c[2] >= +z0 && c[2] <= +z1, output);
console.log(JSON.stringify(res));
