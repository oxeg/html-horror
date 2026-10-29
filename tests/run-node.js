// Runs the engine tests in Node, with no npm: `node tests/run-node.js`.
// unit: fixture story + engine (+ check.js, sound.js once they exist) + tests/unit/*.test.js
// game: the real game files in index.html order + playthroughs + game.test.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const GAME = path.join(ROOT, "babysitting-rules");

function suite(name, files) {
  const ctx = vm.createContext({ ROOMS: {}, console });
  for (const file of files) {
    vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: path.relative(ROOT, file) });
  }
  const res = vm.runInContext("runTests()", ctx);
  for (const f of res.failures) console.log(`FAIL [${name}] ${f.name}: ${f.message}`);
  return { passed: res.passed, failed: res.failures.length };
}

function optional(file) {
  return fs.existsSync(file) ? [file] : [];
}

function gameScripts() {
  const html = fs.readFileSync(path.join(GAME, "index.html"), "utf8");
  return [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => path.join(GAME, m[1]));
}

const unitTests = fs.readdirSync(path.join(__dirname, "unit"))
  .filter((f) => f.endsWith(".test.js")).sort()
  .map((f) => path.join(__dirname, "unit", f));

const results = [
  suite("unit", [
    path.join(__dirname, "fixtures/story.js"),
    path.join(__dirname, "fixtures/rooms.js"),
    path.join(GAME, "engine.js"),
    ...optional(path.join(GAME, "check.js")),
    ...optional(path.join(GAME, "sound.js")),
    path.join(__dirname, "harness.js"),
    ...unitTests,
  ]),
];

if (fs.existsSync(path.join(GAME, "index.html"))) {
  results.push(suite("game", [
    ...gameScripts(),
    path.join(__dirname, "harness.js"),
    path.join(__dirname, "playthroughs.js"),
    path.join(__dirname, "game.test.js"),
  ]));
}

const passed = results.reduce((n, r) => n + r.passed, 0);
const failed = results.reduce((n, r) => n + r.failed, 0);
console.log(failed ? `${failed} FAILED (${passed} passed)` : `ALL PASS (${passed} tests)`);
process.exit(failed ? 1 : 0);
