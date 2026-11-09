# Local server for making the preview pictures (posters): serves the site folder and saves
# POST /upload?name=<id> bodies as <out>/<id>.webp. See CLAUDE.md, "Картинки-превью".
# Usage: python3 serve_upload.py ../site ../build/posters_raw   (then open http://localhost:8772/?shot=<id>)
import sys, os, re
from http.server import SimpleHTTPRequestHandler, HTTPServer
from functools import partial

ROOT, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)


class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        m = re.match(r"^/upload\?name=([a-z]+)$", self.path)
        if not m:
            self.send_response(400); self.end_headers(); return
        data = self.rfile.read(int(self.headers["content-length"]))
        open(os.path.join(OUT, m.group(1) + ".webp"), "wb").write(data)
        self.send_response(200); self.end_headers(); self.wfile.write(b"saved")

    def log_message(self, *a):
        pass


HTTPServer(("127.0.0.1", 8772), partial(Handler, directory=ROOT)).serve_forever()
