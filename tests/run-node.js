// Runs the engine tests in Node, with no npm: `node tests/run-node.js`.
// unit: the fixture drawings + engine, save, toolbox, loader, check, sound + the fixture's rules.js, then
//   Loader.read(the fixture's index.html) + tests/unit/*.test.js (all in tests/fixtures/)
// game: the real game files in index.html order, then Loader.read(index.html) + playthroughs + game.test.js
// migration (until Task 14): the frozen old story + drawings + engine + save + toolbox + loader + rules.js +
//   migration.test.js, with index.html's source as INDEX_HTML
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const minidom = require("./minidom");

const ROOT = path.join(__dirname, "..");
const GAME = path.join(ROOT, "babysitting-rules");

// Each step is a file to run, or { code, filename } for a line of glue. `globals` go into the context.
function suite(name, steps, globals) {
  const ctx = vm.createContext(Object.assign({ ROOMS: {}, console, minidom }, globals));
  for (const step of steps) {
    const code = step.code || fs.readFileSync(step, "utf8");
    vm.runInContext(code, ctx, { filename: step.filename || path.relative(ROOT, step) });
  }
  const res = vm.runInContext("runTests()", ctx);
  for (const f of res.failures) console.log(`FAIL [${name}] ${f.name}: ${f.message}`);
  return { passed: res.passed, failed: res.failures.length };
}

const INDEX = path.join(GAME, "index.html");
const INDEX_HTML = fs.existsSync(INDEX) ? fs.readFileSync(INDEX, "utf8") : "";

function gameScripts() {
  return [...INDEX_HTML.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => path.join(GAME, m[1]));
}

// What the page does on load: read the rooms, notes and endings out of index.html.
const readPage = { code: "Loader.read(minidom(INDEX_HTML).body);", filename: "index.html (Loader.read)" };

// The unit tests' made-up world, read the same way.
const FIXTURES = path.join(__dirname, "fixtures");
const FIXTURE_HTML = fs.readFileSync(path.join(FIXTURES, "index.html"), "utf8");
const readFixture = { code: "Loader.read(minidom(FIXTURE_HTML).body);", filename: "tests/fixtures/index.html (Loader.read)" };

const unitTests = fs.readdirSync(path.join(__dirname, "unit"))
  .filter((f) => f.endsWith(".test.js")).sort()
  .map((f) => path.join(__dirname, "unit", f));

const drawings = fs.readdirSync(path.join(GAME, "rooms"))
  .filter((f) => f.endsWith(".js")).sort()
  .map((f) => path.join(GAME, "rooms", f));

const results = [
  suite("unit", [
    path.join(FIXTURES, "drawings.js"),
    path.join(GAME, "engine.js"),
    path.join(GAME, "save.js"),
    path.join(GAME, "toolbox.js"),
    path.join(GAME, "loader.js"),
    path.join(GAME, "check.js"),
    path.join(GAME, "sound.js"),
    path.join(FIXTURES, "rules.js"),
    readFixture,
    path.join(__dirname, "harness.js"),
    ...unitTests,
  ], { FIXTURE_HTML }),
];

if (INDEX_HTML) {
  results.push(suite("game", [
    ...gameScripts(),
    readPage,
    path.join(__dirname, "harness.js"),
    path.join(__dirname, "playthroughs.js"),
    path.join(__dirname, "game.test.js"),
  ], { INDEX_HTML }));
}

results.push(suite("migration", [
  path.join(__dirname, "fixtures/old-story.js"),
  ...drawings,
  path.join(GAME, "engine.js"),
  path.join(GAME, "save.js"),
  path.join(GAME, "toolbox.js"),
  path.join(GAME, "loader.js"),
  path.join(__dirname, "tools/renames.js"),
  path.join(GAME, "rules.js"),
  path.join(__dirname, "harness.js"),
  path.join(__dirname, "migration.test.js"),
], { INDEX_HTML }));

const passed = results.reduce((n, r) => n + r.passed, 0);
const failed = results.reduce((n, r) => n + r.failed, 0);
console.log(failed ? `${failed} FAILED (${passed} passed)` : `ALL PASS (${passed} tests)`);
process.exit(failed ? 1 : 0);
