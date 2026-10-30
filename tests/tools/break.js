// Builder-only: `node tests/tools/break.js` makes the broken copies of the game that tests/errors.html
// opens, each in tests/tools/out/broken-<name>/, and writes tests/tools/out/broken.js with the lines
// it broke. Run it again after changing the game, then open tests/errors.html over http.
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..", "..");
var GAME = path.join(ROOT, "babysitting-rules");
var OUT = path.join(__dirname, "out");
var BROKEN = {};

// A fresh copy of the game in out/broken-<name>/, then fn(dir) breaks it.
function copy(name, fn) {
  var dir = path.join(OUT, "broken-" + name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.cpSync(GAME, dir, { recursive: true });
  BROKEN[name] = fn(dir) || {};
}

// Changes one line of a file: the first one that matches re (the last one if last is true).
// Gives its line number, counted from 1 like an editor does.
function editLine(file, re, change, last) {
  var lines = fs.readFileSync(file, "utf8").split("\n");
  var found = -1;
  lines.forEach(function (line, i) { if (re.test(line) && (found < 0 || last)) found = i; });
  if (found < 0) throw new Error(path.relative(ROOT, file) + ": no line matches " + re);
  lines[found] = change(lines[found]);
  fs.writeFileSync(file, lines.join("\n"));
  return found + 1;
}

// Puts text in a file right before the first place that matches.
function insertBefore(file, marker, text) {
  var source = fs.readFileSync(file, "utf8");
  var at = source.indexOf(marker);
  if (at < 0) throw new Error(path.relative(ROOT, file) + ": can't find " + JSON.stringify(marker));
  fs.writeFileSync(file, source.slice(0, at) + text + source.slice(at));
}

// A typo the browser finds while reading the file: one ")" too many after the first say(…).
copy("typo", function (dir) {
  return { line: editLine(path.join(dir, "rules.js"), /^\s*say\(.*\);\s*$/, function (l) { return l.replace(/\);(\s*)$/, "));$1"); }) };
});

// A typo near the end, after the whenClicked scripts: the rules above it already registered.
copy("typo-at-end", function (dir) {
  return { line: editLine(path.join(dir, "rules.js"), /^when\(/, function (l) { return l.replace(/^when\(/, "When("); }, true) };
});

// What Chrome may say about a mistake when the game is opened from a file: "Script error.", with
// no file and no line, and maybe no document.currentScript either. Over http that can only be
// pretended: rules.js starts by reporting one that way. The first script that hasn't finished
// loading is then rules.js.
copy("hidden", function (dir) {
  var rules = path.join(dir, "rules.js");
  fs.writeFileSync(rules,
    'Object.defineProperty(document, "currentScript", { get: function () { return null; } });\n' +
    'window.onerror("Script error.", "", 0, 0, null);\n' + fs.readFileSync(rules, "utf8"));
});

copy("view", function (dir) {
  fs.rmSync(path.join(dir, "engine", "view.js"), { force: true });
});

copy("engine", function (dir) {
  fs.rmSync(path.join(dir, "engine"), { recursive: true, force: true });
});

// Her "add a room" mission without a drawing: a section, a door to it from the hallway, and a
// position for its button. It plays with the plain room.
copy("room", function (dir) {
  var index = path.join(dir, "index.html");
  insertBefore(index, '<a href="#living">Living room</a>', '<a href="#attic">Attic</a>\n      ');
  insertBefore(index, "<!-- The living room",
    '<section class="room" id="attic" title="Attic">\n' +
    '    <nav>Go to: <a href="#entrance">Hallway</a></nav>\n' +
    '    <button id="dusty-box" title="Dusty box">Old photos. Everybody looks so young.</button>\n' +
    "  </section>\n\n  ");
  fs.appendFileSync(path.join(dir, "style.css"), "#dusty-box { left: 40%; top: 40%; width: 10%; height: 10%; }\n");
});

// A mistake check.js finds in index.html: a button that ends the game with an ending that isn't there.
copy("story", function (dir) {
  editLine(path.join(dir, "index.html"), /<button id="coats"/, function (l) { return l.replace('<button id="coats"', '<button id="coats" data-ending="no-such-ending"'); });
});

fs.writeFileSync(path.join(OUT, "broken.js"),
  "// Made by tests/tools/break.js: the broken copies of the game, and the lines it broke.\n" +
  "var BROKEN = " + JSON.stringify(BROKEN, null, 2) + ";\n");
console.log("wrote " + Object.keys(BROKEN).map(function (n) { return "broken-" + n; }).join(", ") + " and broken.js in tests/tools/out/");
