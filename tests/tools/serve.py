# Serves the repo on http://127.0.0.1:8765 with caching turned off, for the browser tests.
# Run from anywhere: python3 tests/tools/serve.py
# A PUT to /tests/tools/out/<file> saves the body there, so builder pages can hand back long results.
import functools
import http.server
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "tests", "tools", "out")


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass

    def do_PUT(self):
        name = os.path.basename(self.path.split("?")[0])
        if not self.path.startswith("/tests/tools/out/") or not name:
            self.send_error(403)
            return
        os.makedirs(OUT, exist_ok=True)
        with open(os.path.join(OUT, name), "wb") as f:
            f.write(self.rfile.read(int(self.headers.get("Content-Length", 0))))
        self.send_response(204)
        self.end_headers()


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 8765), functools.partial(Handler, directory=ROOT))
    server.serve_forever()
