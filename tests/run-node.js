// Runs the engine tests in Node, with no npm: `node tests/run-node.js`.
// unit: the fixture drawings + engine, save, toolbox, loader, check, sound + the fixture's rules.js, then
//   Loader.read(the fixture's index.html) + tests/unit/*.test.js (all in tests/fixtures/)
// game: the drawings (engine/drawings/*.js, but not plain.js), then the game files in index.html order (but
//   not engine/errors.js, which needs a page), then Loader.read(index.html) + playthroughs + game.test.js
// migration (until Task 14): the frozen old story + drawings + engine + save + toolbox + loader + rules.js +
//   migration.test.js, with index.html's source as INDEX_HTML
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const minidom = require("./minidom");

const ROOT = path.join(__dirname, "..");
const GAME = path.join(ROOT, "babysitting-rules");
const ENGINE = path.join(GAME, "engine");

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

// In a page, errors.js watches the others load and starts the game; here, readPage does that.
function gameScripts() {
  return [...INDEX_HTML.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)]
    .map((m) => m[1]).filter((src) => src !== "engine/errors.js")
    .map((src) => path.join(GAME, src));
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

// In a page, loader.js adds a drawing for every room; here they come from the folder. Every room
// in the game has its own, so the plain one stays out (and a missing drawing shows up in Check.run).
const drawings = fs.readdirSync(path.join(ENGINE, "drawings"))
  .filter((f) => f.endsWith(".js") && f !== "plain.js").sort()
  .map((f) => path.join(ENGINE, "drawings", f));

const results = [
  suite("unit", [
    path.join(FIXTURES, "drawings.js"),
    path.join(ENGINE, "engine.js"),
    path.join(ENGINE, "save.js"),
    path.join(ENGINE, "toolbox.js"),
    path.join(ENGINE, "loader.js"),
    path.join(ENGINE, "check.js"),
    path.join(ENGINE, "sound.js"),
    path.join(FIXTURES, "rules.js"),
    readFixture,
    path.join(__dirname, "harness.js"),
    ...unitTests,
  ], { FIXTURE_HTML }),
];

if (INDEX_HTML) {
  results.push(suite("game", [
    ...drawings,
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
  path.join(ENGINE, "engine.js"),
  path.join(ENGINE, "save.js"),
  path.join(ENGINE, "toolbox.js"),
  path.join(ENGINE, "loader.js"),
  path.join(__dirname, "tools/renames.js"),
  path.join(GAME, "rules.js"),
  path.join(__dirname, "harness.js"),
  path.join(__dirname, "migration.test.js"),
], { INDEX_HTML }));

const passed = results.reduce((n, r) => n + r.passed, 0);
const failed = results.reduce((n, r) => n + r.failed, 0);
console.log(failed ? `${failed} FAILED (${passed} passed)` : `ALL PASS (${passed} tests)`);
process.exit(failed ? 1 : 0);
