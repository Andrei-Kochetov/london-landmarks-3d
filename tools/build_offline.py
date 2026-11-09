# One-file copy of the site: models and preview pictures embedded as data URIs,
# so the page opens by double-click from disk (internet is still needed for model-viewer and fonts).
# Usage: python3 build_offline.py ../site ../build/London_Landmarks_3D.html
import sys, os, json, base64

site, out = sys.argv[1], sys.argv[2]
s = open(os.path.join(site, "index.html"), encoding="utf-8").read()


def rep(a, b):
    global s
    assert s.count(a) == 1, "not found exactly once: " + a[:80]
    s = s.replace(a, b)


ids = ["palace", "tower", "bigben", "eye", "opera", "square", "abbey", "gallery"]
emb = {"models": {}, "posters": {}}
for k in ids:
    emb["models"][k] = "data:model/gltf-binary;base64," + base64.b64encode(open(os.path.join(site, "models", k + ".glb"), "rb").read()).decode()
    emb["posters"][k] = "data:image/webp;base64," + base64.b64encode(open(os.path.join(site, "models", "posters", k + ".webp"), "rb").read()).decode()
rep("  const SHOT = new URLSearchParams", "  const EMBED = " + json.dumps(emb) + "; // models and pictures live inside this file\n  const SHOT = new URLSearchParams")
rep("""'<model-viewer src="models/' + m.file + '.glb?v=' + MODEL_VERSION + '" poster="models/posters/' + s.id + '.webp?v=' + MODEL_VERSION + '" alt=""",
    """'<model-viewer src="' + EMBED.models[s.id] + '" poster="' + EMBED.posters[s.id] + '" alt=""")
rep("if (navigator.connection && navigator.connection.saveData) return; // the phone asked to save data",
    "return; // the models are already inside this file, nothing to download")
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, "w", encoding="utf-8").write(s)
print("written", out, round(len(s) / 1048576, 1), "MB")
