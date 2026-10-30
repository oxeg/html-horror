// Builder-only, migration-only (Task 14 deletes it): `node tests/tools/port.js` turns the frozen old
// story (tests/fixtures/old-story.js) into HTML for index.html, with the new ids from RENAMES, and the
// recorded hotspot boxes into button positions for style.css. It writes two drafts:
//   tests/tools/out/content.html  rooms, notes and endings (paste into index.html above the scripts)
//   tests/tools/out/positions.css one line per button, in % of the picture (for Task 7)
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.join(__dirname, "..", "..");
var GAME = path.join(ROOT, "babysitting-rules");
var OUT = path.join(__dirname, "out");

// The old story, the drawings, the renames and the boxes, all in one sandbox.
var ctx = vm.createContext({ ROOMS: {} });
function load(file) { vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: file }); }
load(path.join(ROOT, "tests/fixtures/old-story.js"));
fs.readdirSync(path.join(GAME, "rooms")).sort().forEach(function (f) { load(path.join(GAME, "rooms", f)); });
load(path.join(__dirname, "renames.js"));
load(path.join(ROOT, "tests/fixtures/hotspot-boxes.js"));
var old = vm.runInContext("({ rooms: ROOM_INFO, notes: NOTES, endings: ENDINGS, drawings: ROOMS, renames: RENAMES, boxes: HOTSPOT_BOXES })", ctx);

function capitalize(text) { return text ? text.charAt(0).toUpperCase() + text.slice(1) : text; }
function attr(value) { return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }
function text(value) { return String(value || "").replace(/&(?![a-z#0-9]+;)/gi, "&amp;"); }
function renamed(map, id) { return (map && map[id]) || id; }

// The old hotspot ids in the order the drawing has them (later ones sit on top). The drawings
// name them with data-name now (data-hotspot before Task 7); the filter below keeps only hotspots.
function drawingOrder(roomId) {
  var seen = [];
  var re = /data-(?:name|hotspot)="([^"]+)"/g;
  var m;
  while ((m = re.exec(old.drawings[roomId] || ""))) if (seen.indexOf(m[1]) < 0) seen.push(m[1]);
  Object.keys(old.rooms[roomId].hotspots).forEach(function (id) { if (seen.indexOf(id) < 0) seen.push(id); });
  return seen.filter(function (id) { return old.rooms[roomId].hotspots[id]; });
}

var cameraRoom = Object.keys(old.rooms).filter(function (id) { return old.rooms[id].overlay; })[0];

function button(roomId, id) {
  var h = old.rooms[roomId].hotspots[id];
  var newId = renamed(old.renames.hotspots[roomId], id);
  var tag = h.goTo ? "a" : "button";
  var a = ['id="' + newId + '"'];
  if (newId !== id) a.push('class="' + id + '"');
  if (h.goTo) a.push('href="#' + h.goTo + '"');
  a.push('title="' + attr(capitalize(h.label)) + '"');
  if (h.note) a.push('data-note="' + renamed(old.renames.notes, h.note) + '"');
  if (h.ending) a.push('data-ending="' + renamed(old.renames.endings, h.ending) + '"');
  if (h.action === "camera") a.push('data-camera="' + cameraRoom + '"');
  if (h.minutes !== undefined) a.push('data-minutes="' + h.minutes + '"');
  if (h.hidden) a.push("hidden");
  return "  <" + tag + " " + a.join(" ") + ">" + text(capitalize(h.text)) + "</" + tag + ">";
}

function room(roomId) {
  var r = old.rooms[roomId];
  var name = capitalize(r.name);
  var lines = [];
  lines.push(r.overlay
    ? "<!-- The " + r.name.toLowerCase() + ". It's not a room you walk into: it opens on top of the hallway. -->"
    : "<!-- " + name + " -->");
  lines.push('<section class="' + (r.overlay ? "room camera" : "room") + '" id="' + roomId + '" title="' + attr(name) + '">');
  var links = (r.exits || []).map(function (to) { return '<a href="#' + to + '">' + text(capitalize(old.rooms[to].name)) + "</a>"; });
  if (links.length === 1) lines.push("  <nav>Go to: " + links[0] + "</nav>");
  if (links.length > 1) lines.push("  <nav>Go to:\n    " + links.join("\n    ") + "\n  </nav>");
  if (links.length) lines.push("");
  drawingOrder(roomId).forEach(function (id) { lines.push(button(roomId, id)); });
  lines.push("</section>");
  return lines.join("\n");
}

// A note: the fridge note's heading line becomes <h2> and "Mom & Dad", its numbered lines an <ol>,
// "Love you!" the signature. A note without "Love you" (the fake one) is just paragraphs.
function note(id) {
  var n = old.notes[id];
  var lines = String(n.text).split(/<br\s*\/?>/).map(function (l) { return l.trim(); }).filter(function (l) { return l; });
  var fake = n.look === "fake";
  var out = ['<article class="note' + (fake ? " fake" : "") + '" id="' + renamed(old.renames.notes, id) + '">'];
  var rules = [];
  lines.forEach(function (line, i) {
    var heading = /^<b>(.*?)<\/b>,\s*(.*)$/.exec(line);
    var rule = /^\d+\.\s+(.*)$/.exec(line);
    if (!fake && i === 0 && heading) {
      out.push("  <h2>" + text(heading[1]) + "</h2>", "  <p>" + text(heading[2]) + "</p>");
    } else if (rule) {
      rules.push("    <li>" + text(rule[1]) + "</li>");
    } else if (!fake && /Love you/.test(line)) {
      if (rules.length) out.push("  <ol>", rules.join("\n"), "  </ol>");
      rules = [];
      out.push('  <p class="sign">' + text(line) + "</p>");
    } else {
      out.push("  <p>" + text(line) + "</p>");
    }
  });
  if (rules.length) out.push("  <ol>", rules.join("\n"), "  </ol>");
  out.push("</article>");
  return out.join("\n");
}

function ending(id) {
  var e = old.endings[id];
  var cls = e.win ? "ending win" : "ending";
  var a = 'class="' + cls + '" id="' + renamed(old.renames.endings, id) + '"' + (e.sound ? ' data-sound="' + e.sound + '"' : "");
  var body = text(e.text).replace(/<br>\s*/g, "<br>\n    ");
  return "<section " + a + ">\n  <h1>" + text(e.title) + "</h1>\n  <p>" + body + "</p>\n</section>";
}

var html = [];
Object.keys(old.rooms).forEach(function (id) { html.push(room(id)); });
html.push("<!-- The notes you can find -->");
Object.keys(old.notes).forEach(function (id) { html.push(note(id)); });
html.push("<!-- The endings -->");
Object.keys(old.endings).forEach(function (id) { html.push(ending(id)); });

// Positions: one line per button, in % of the 1600x900 picture, in the order of the HTML.
function pct(n) { return n.toFixed(1) + "%"; }
var css = [];
Object.keys(old.rooms).forEach(function (roomId) {
  css.push("/* " + capitalize(old.rooms[roomId].name) + " */");
  drawingOrder(roomId).forEach(function (id) {
    var b = (old.boxes[roomId] || {})[id];
    var newId = renamed(old.renames.hotspots[roomId], id);
    if (!b) return css.push("/* #" + newId + ": no recorded box */");
    css.push("#" + newId + " { left: " + pct(b[0] / 16) + "; top: " + pct(b[1] / 9) + "; width: " + pct(b[2] / 16) + "; height: " + pct(b[3] / 9) + "; }");
  });
});

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "content.html"), html.join("\n\n") + "\n");
fs.writeFileSync(path.join(OUT, "positions.css"), css.join("\n") + "\n");
console.log("wrote tests/tools/out/content.html and tests/tools/out/positions.css");
