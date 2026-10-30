// check.js: looks over index.html, rules.js and the drawings before the game starts and says
// what's wrong in plain words: which file to fix, and the line where it can. Errors stop the game;
// warnings are only a note.
// Check.run() never touches the page, so the tests can run it in Node too. Check.layout() measures
// where the buttons sit (style.css), so it only works in a page.
// You don't need to change this file.

var Check = (function () {
  var C = {};
  var GLOBAL = typeof globalThis !== "undefined" ? globalThis : this;
  // Words that can come before "(" without being a call.
  var KEYWORDS = ["if", "for", "while", "switch", "catch", "function", "return", "typeof", "void", "delete",
    "new", "in", "of", "do", "else", "case", "throw", "with", "await", "yield", "instanceof", "super", "this"];
  // The block that gives a rule each trigger.
  var WAITS = { inRoom: "inRoom", nextEntry: "enteringRoomWith", beam: "lightFinds" };
  var TIME = 'isn\'t written like 19:05 (two digits, a colon, two digits).';

  function ids(obj) { return Object.keys(obj || {}); }
  function has(obj, key) { return !!obj && Object.prototype.hasOwnProperty.call(obj, key); }
  function isRoom(id) { return has(ROOM_INFO, id); }
  function list(value) { return Array.isArray(value) ? value : [value]; }
  function add(to, value) { if (value && to.indexOf(value) < 0) to.push(value); }
  function badTime(time) { return isNaN(Game.parseTime(time)); }
  // An id made from a title, for an example: "Light switch" -> "light-switch".
  function idFrom(title, or) { return String(title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || or; }
  function clicks(n) { return n + (n === 1 ? " click" : " clicks"); }
  function inRules(line) { return "rules.js" + (line ? " (line " + line + ")" : "") + ": "; }

  // ---- "did you mean …?" ----

  // How many letters to add, take out or change to turn a into b.
  function distance(a, b) {
    var row = [];
    for (var j = 0; j <= b.length; j++) row.push(j);
    for (var i = 1; i <= a.length; i++) {
      var diagonal = row[0];
      row[0] = i;
      for (j = 1; j <= b.length; j++) {
        var above = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
        diagonal = above;
      }
    }
    return row[b.length];
  }

  // "did you mean fridge?" for the known word 2 or fewer typing mistakes away (the closest), else "".
  // A word shorter than its mistakes is too short to guess.
  C.suggest = function (word, known) {
    if (typeof word !== "string" || !word) return "";
    var best = "", bestDistance = 3;
    (known || []).forEach(function (k) {
      if (typeof k !== "string" || k === word || Math.abs(k.length - word.length) >= bestDistance) return;
      var d = distance(word, k);
      if (d < bestDistance && d < word.length) { best = k; bestDistance = d; }
    });
    return best ? "did you mean " + best + "?" : "";
  };

  // The end of a sentence: ", did you mean fridge?" or just ".".
  function orGuess(word, known) {
    var guess = C.suggest(word, known);
    return guess ? ", " + guess : ".";
  }

  // ---- what the world has ----

  // A room or button with no id is in the loader's lists as "null": it's not a name you can use.
  function rooms() { return ids(ROOM_INFO).filter(function (id) { return id !== "null"; }); }

  function eachSpot(fn) {
    ids(ROOM_INFO).forEach(function (r) {
      ids(ROOM_INFO[r].hotspots).forEach(function (h) { fn(ROOM_INFO[r].hotspots[h], h, r); });
    });
  }
  function namesOf(spot, id) { return spot.names || [id]; }
  function noId(spot, id) { return namesOf(spot, id)[0] === null; }

  // The names in the world: rooms, cameras, buttons (ids and classes), and everything show() can
  // find (the buttons, and the named parts of the room drawings).
  function names() {
    var n = { rooms: rooms(), buttons: [], things: [] };
    n.cameras = n.rooms.filter(function (r) { return ROOM_INFO[r].overlay; });
    eachSpot(function (spot, h) { namesOf(spot, h).forEach(function (name) { add(n.buttons, name); }); });
    n.things = n.buttons.slice();
    n.rooms.forEach(function (r) {
      var svg = typeof ROOMS !== "undefined" && typeof ROOMS[r] === "string" ? ROOMS[r] : "";
      var re = /\sdata-name="([^"]+)"/g, m;
      while ((m = re.exec(svg))) add(n.things, m[1]);
    });
    return n;
  }

  // The hotspot a name points at in a room: its id, or one of its names (a class in index.html).
  function spotNamed(roomId, name) {
    var id = Game.findHotspot(roomId, name);
    return id ? ROOM_INFO[roomId].hotspots[id] : null;
  }

  // The rooms a step happens in: its own, or for a click with no room, every room with that button
  // (by id or class, so click("lock") is in either bathroom).
  function stepRooms(step) {
    if (step.room !== undefined) return list(step.room);
    return ids(ROOM_INFO).filter(function (r) { return !!spotNamed(r, step.hotspot); });
  }

  // ---- the walking graph: exits plus hotspots that move you (goTo) ----

  function neighbours(roomId) {
    var info = ROOM_INFO[roomId];
    var out = (info.exits || []).filter(isRoom);
    ids(info.hotspots).forEach(function (h) {
      var to = info.hotspots[h].goTo;
      if (to && isRoom(to) && out.indexOf(to) < 0) out.push(to);
    });
    return out;
  }

  // Number of moves from one room to every room it can reach.
  function distances(from) {
    var dist = {};
    var queue = [from];
    dist[from] = 0;
    while (queue.length) {
      var r = queue.shift();
      neighbours(r).forEach(function (n) {
        if (dist[n] === undefined) {
          dist[n] = dist[r] + 1;
          queue.push(n);
        }
      });
    }
    return dist;
  }

  // Fewest actions needed to do the steps in order, starting in fromRoom.
  // Infinity if some step can never be done.
  C.shortest = function (fromRoom, steps) {
    var best = {};
    best[fromRoom] = 0;
    function put(map, room, cost) {
      if (map[room] === undefined || cost < map[room]) map[room] = cost;
    }
    steps.forEach(function (step) {
      var next = {};
      ids(best).forEach(function (room) {
        var cost = best[room];
        if (step.leave !== undefined) {
          // Anywhere else is fine; if we are in that room, one move gets us out.
          if (room !== step.leave) return put(next, room, cost);
          var out = isRoom(room) ? neighbours(room) : [];
          if (!out.length) return put(next, room, cost + 1);
          return out.forEach(function (n) { put(next, n, cost + 1); });
        }
        var dist = isRoom(room) ? distances(room) : {};
        stepRooms(step).forEach(function (target) {
          if (dist[target] === undefined) return;
          if (!step.hotspot) return put(next, target, cost + dist[target]);
          var h = spotNamed(target, step.hotspot);
          put(next, (h && h.goTo) || target, cost + dist[target] + 1);
        });
      });
      best = next;
    });
    var min = Infinity;
    ids(best).forEach(function (room) { if (best[room] < min) min = best[room]; });
    return min;
  };

  // Where a danger can start.
  function startRooms(ev) {
    var all = ids(ROOM_INFO).filter(function (id) { return !ROOM_INFO[id].overlay; });
    if (ev.trigger === "inRoom") return [ev.room];
    if (ev.trigger === "nextEntry" || ev.trigger === "beam") {
      return all.filter(function (id) { return Game.roomHas(id, ev.group); });
    }
    return all.filter(function (id) { return (ev.notIn || []).indexOf(id) < 0; });
  }

  // ---- reading a script without running it ----

  // The names a script makes for itself: function name() { … } and var name.
  function ownNames(fn, calls) {
    var own = calls.filter(function (c) { return c.declared; }).map(function (c) { return c.name; });
    var re = /\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)/g, m;
    while ((m = re.exec(String(fn)))) own.push(m[1]);
    return own;
  }

  function unknownCalls(fn, calls) {
    var own = ownNames(fn, calls);
    return calls.filter(function (c) {
      return !c.method && !c.declared && KEYWORDS.indexOf(c.name) < 0 && own.indexOf(c.name) < 0 &&
        Toolbox.blocks.indexOf(c.name) < 0 && typeof GLOBAL[c.name] !== "function";
    });
  }

  // The words a script calls that aren't blocks, JS words, the browser's own functions, her own
  // functions, or methods (list.push): [{ name, line }], line 1 being the script's first line.
  C.scan = function (fn) {
    return unknownCalls(fn, Toolbox.calls(fn)).map(function (c) { return { name: c.name, line: c.line }; });
  };

  // The words a script hands to show, hide, isShown, playSound and endGame, also inside her own
  // functions that it calls (each read once).
  C.scanNames = function (fn) {
    var out = { show: [], hide: [], isShown: [], playSound: [], endGame: [] };
    var read = [];
    (function scan(f) {
      read.push(f);
      Toolbox.calls(f).forEach(function (c) {
        if (c.method || c.declared) return;
        if (has(out, c.name)) c.words.forEach(function (w) { if (out[c.name].indexOf(w) < 0) out[c.name].push(w); });
        var own = ownFunction(c.name);
        if (own && read.indexOf(own) < 0) scan(own);
      });
    })(fn);
    return out;
  };

  function notDefined(message) {
    var m = /^(\S+) is not defined/.exec(message || "");
    return m ? m[1] : "";
  }

  // A mistake a script made while playing, in words (view.js shows it in a small box):
  // "rules.js line 57: sya is not defined. Did you mean say?"
  C.describe = function (p) {
    var guess = C.suggest(notDefined(p.message), Toolbox.blocks);
    return p.file + (p.line ? " line " + p.line : "") + ": " + String(p.message).replace(/\.?$/, ".") +
      (guess ? " " + guess.charAt(0).toUpperCase() + guess.slice(1) : "");
  };

  // ---- the checks ----

  C.run = function () {
    var out = { errors: [], warnings: [] };
    var n = names();
    checkShape(out);
    checkLinks(out, n);
    checkRules(out, n);
    return out;
  };

  // The shape of index.html: ids, titles, and what's inside what.
  function checkShape(out) {
    var elements = (typeof Loader !== "undefined" && Loader.elements) || [];
    var first = Object.create(null), told = Object.create(null);  // (an id like "constructor" is fine too)
    elements.forEach(function (el) {
      if (!el.id) return;
      if (first[el.id] && !told["id " + el.id]) {
        told["id " + el.id] = true;
        out.errors.push('index.html: two things have the same id "' + el.id + '". Every id must be different, like sprite names in Scratch.');
      }
      first[el.id] = first[el.id] || el;
    });
    function kind(el) {
      var is = function (c) { return el.classes.indexOf(c) >= 0; };
      return el.tag === "section" && is("room") ? "room" : el.tag === "section" && is("ending") ? "ending" : el.tag === "article" && is("note") ? "note" : el.tag;
    }
    var spots = Object.create(null);
    eachSpot(function (spot, h) { spots[h] = true; });
    elements.forEach(function (el) {
      var outer = null;
      el.inside.forEach(function (id) { if (first[id] && /^(section|article)$/.test(first[id].tag)) outer = first[id]; });
      if (el.id && /^(section|article)$/.test(el.tag) && outer && !told["in " + outer.id]) {
        told["in " + outer.id] = true;
        out.errors.push("index.html: the " + kind(el) + ' "' + el.id + '" is inside the ' + kind(outer) + ' "' + outer.id + '". Did you forget </' + outer.tag + '> at the end of "' + outer.id + '"?');
      }
      if (el.tag === "button" && el.id && !spots[el.id] && !el.inside.some(isRoom)) {
        out.errors.push('index.html: the button "' + el.id + '" isn\'t inside any room. Move it into a <section class="room">, before its </section>.');
      }
    });
    ids(ROOM_INFO).forEach(function (id) {
      var room = ROOM_INFO[id];
      if (id === "null") {
        out.errors.push("index.html: a room" + (room.name ? ' (its title is "' + room.name + '")' : "") + ' has no id. Give it one, like <section class="room" id="' + idFrom(room.name, "attic") + '">: everything else finds the room by its id.');
      } else if (!room.name) {
        out.errors.push('index.html: the room "' + id + '" has no title. Add title="…" to its <section>: it\'s the name on the button that takes you there.');
      }
    });
    eachSpot(function (spot, h, r) {
      var where = r === "null" ? "" : ' in the room "' + r + '"';
      if (noId(spot, h)) {
        out.errors.push("index.html: a button" + where + (spot.label ? ' (title="' + spot.label + '")' : "") + ' has no id. Give it one, like id="' + idFrom(spot.label, "lamp") + '": rules.js and style.css find it by its id.');
      } else if (!spot.label) {
        out.errors.push('index.html: the button "' + h + '"' + where + ' has no title. Add title="…": it\'s the name you see when your light is on it.');
      }
    });
  }

  // What index.html points at: rooms, notes, endings and cameras that must be there.
  function checkLinks(out, n) {
    n.rooms.forEach(function (id) {
      (ROOM_INFO[id].exits || []).forEach(function (to) {
        if (!isRoom(to)) out.errors.push('index.html: the room "' + id + '" has a link to "#' + to + '", but no room has the id "' + to + '"' + orGuess(to, n.rooms));
      });
    });
    eachSpot(function (spot, h) {
      if (noId(spot, h)) return;  // said already
      var what = "index.html: the " + (spot.goTo !== undefined ? "link" : "button") + ' "' + h + '"';
      if (spot.goTo !== undefined && !isRoom(spot.goTo)) out.errors.push(what + ' goes to "#' + spot.goTo + '", but no room has the id "' + spot.goTo + '"' + orGuess(spot.goTo, n.rooms));
      if (spot.note !== undefined && !has(NOTES, spot.note)) out.errors.push(what + ' has data-note="' + spot.note + '", but no note has the id "' + spot.note + '"' + orGuess(spot.note, ids(NOTES)));
      if (spot.ending !== undefined && !has(ENDINGS, spot.ending)) out.errors.push(what + ' has data-ending="' + spot.ending + '", but no ending has the id "' + spot.ending + '"' + orGuess(spot.ending, ids(ENDINGS)));
      if (spot.camera !== undefined && n.cameras.indexOf(spot.camera) < 0) out.errors.push(what + ' has data-camera="' + spot.camera + '", but there is no <section class="room camera" id="' + spot.camera + '">' + orGuess(spot.camera, n.cameras));
    });
    if (!ids(ENDINGS).some(function (id) { return ENDINGS[id].win; })) {
      out.warnings.push('index.html: no ending has class="win", so nobody can win. Give the good ending class="ending win".');
    }
    if (typeof ROOMS === "undefined" || typeof ROOMS.title !== "string") out.errors.push("engine/drawings/title.js is missing: the title screen needs its drawing.");

    // the giveaway: the real note is always signed "Love you!", a fake never is
    ids(NOTES).forEach(function (id) {
      var signed = String(NOTES[id].html).indexOf("Love you") >= 0;
      if (NOTES[id].fake && signed) {
        out.warnings.push('index.html: the fake note "' + id + '" says "Love you". The real note is signed "Love you!" and a fake never is: that\'s how you can tell. Take it out.');
      }
      if (!NOTES[id].fake && !signed) {
        out.warnings.push('index.html: the note "' + id + '" isn\'t signed "Love you!". That\'s how you tell the real note from the fake one, so keep it.');
      }
    });
  }

  // rules.js: the setup, every rule (its conditions, then a pretend run, then a reading) and every
  // click script, then the hidden buttons nothing shows.
  function checkRules(out, n) {
    var reading = {
      shown: [],                         // every name a rule, a click script or her own function shows
      endingsSaid: Object.create(null),  // endGame() endings the pretend runs already said are missing
      unknown: [],                       // the words the reading said aren't blocks
      read: [],                          // her own functions read already (each one once)
    };
    if (!isRoom(SETTINGS.startRoom)) out.errors.push('rules.js: startAt(…): the night starts in the room "' + SETTINGS.startRoom + '", but there is no room "' + SETTINGS.startRoom + '" in index.html' + orGuess(SETTINGS.startRoom, n.rooms));
    if (badTime(SETTINGS.startTime)) out.errors.push('rules.js: startAt("' + SETTINGS.startTime + '"): the time "' + SETTINGS.startTime + '" ' + TIME);
    var times = EVENTS.map(function (ev) { return ev.time; });

    EVENTS.forEach(function (ev) {
      var at = inRules(ev.line);
      var hat = 'when("' + ev.time + '", …)';
      if (badTime(ev.time)) out.errors.push(at + 'when("' + ev.time + '", …): the time "' + ev.time + '" ' + TIME);
      var triggers = ev.triggers || [];
      if (triggers.length > 1) {
        out.errors.push(at + hat + " waits for " + triggers.length + " things: " + triggers.map(function (t) { return (WAITS[t] || t) + "(…)"; }).join(" and ") + ". A rule can wait for only one of them.");
      }
      var trigger = ev.trigger || "now";
      if (trigger !== "now" && !has(WAITS, trigger)) {
        out.errors.push(at + hat + ' waits with "' + trigger + '", which isn\'t a block. Use inRoom(…), enteringRoomWith(…) or lightFinds(…).');
      }
      if ((trigger === "nextEntry" || trigger === "beam") && n.things.indexOf(ev.group) < 0) {
        out.errors.push(at + WAITS[trigger] + '("' + ev.group + '"): no button or part of a drawing is called "' + ev.group + '"' + orGuess(ev.group, n.things));
      }
      if (ev.room !== undefined && !isRoom(ev.room)) out.errors.push(at + 'inRoom("' + ev.room + '"): there is no room "' + ev.room + '" in index.html' + orGuess(ev.room, n.rooms));
      (ev.notIn || []).forEach(function (r) {
        if (!isRoom(r)) out.errors.push(at + 'notIn("' + r + '"): there is no room "' + r + '" in index.html' + orGuess(r, n.rooms));
      });
      if (ev.after !== undefined) {
        var same = times.filter(function (t) { return t === ev.after; }).length;
        var others = times.filter(function (t) { return t !== ev.time; });
        if (!same) out.errors.push(at + 'afterRule("' + ev.after + '"): there is no rule at ' + ev.after + orGuess(ev.after, others));
        if (same > 1) out.errors.push(at + 'afterRule("' + ev.after + '"): there are ' + same + " rules at " + ev.after + ", so it can't tell which one you mean. Give one of them another time.");
      }
      (ev.armShow || []).forEach(function (name) { add(reading.shown, name); });
      if (typeof ev.run !== "function") {
        out.errors.push(at + hat + ' needs a function at the end, like when("' + ev.time + '", function () { … });');
        return;
      }

      var does = Toolbox.pretend(ev);
      if (does.ending && !has(ENDINGS, does.ending)) {
        reading.endingsSaid[does.ending] = true;
        out.errors.push(at + 'endGame("' + does.ending + '"): there is no ending "' + does.ending + '" in index.html' + orGuess(does.ending, ids(ENDINGS)));
      }
      if (does.danger) checkDanger(out, n, ev, does.danger, reading.shown);
      readScript(out, n, { fn: ev.run, line: ev.line }, reading);
      does.problems.forEach(function (p) {
        var name = notDefined(p.message);
        if (name && reading.unknown.indexOf(name) >= 0) return;  // the reading said so already
        out.warnings.push(inRules(p.line) + "the rule at " + ev.time + " stops halfway with a mistake: " + String(p.message).replace(/\.$/, "") + orGuess(name, Toolbox.blocks));
      });
    });

    var scripts = Toolbox.clickScripts();
    ids(scripts).forEach(function (name) {
      var at = inRules(scripts[name].line);
      if (n.buttons.indexOf(name) < 0) out.errors.push(at + 'whenClicked("' + name + '"): no button in index.html has the id or class "' + name + '"' + orGuess(name, n.buttons));
      if (typeof scripts[name].run !== "function") {
        out.errors.push(at + 'whenClicked("' + name + '", …) needs a function at the end, like whenClicked("' + name + '", function () { … });');
      } else {
        readScript(out, n, { fn: scripts[name].run, line: scripts[name].line }, reading);
      }
    });

    eachSpot(function (spot, h) {
      if (!spot.hidden || noId(spot, h)) return;
      if (!namesOf(spot, h).some(function (name) { return reading.shown.indexOf(name) >= 0; })) {
        out.warnings.push('index.html: the button "' + h + '" starts hidden, but no rule in rules.js ever shows it. Add show("' + h + '") to a rule, or take out hidden.');
      }
    });
  }

  function unknownThing(out, n, what, name) {
    if (n.things.indexOf(name) < 0) out.warnings.push(what + ' no button or part of a drawing is called "' + name + '"' + orGuess(name, n.things));
  }

  function unknownSound(out, what, name) {
    if (typeof Sound === "undefined" || !Sound.names || Sound.names.indexOf(name) >= 0) return;
    var guess = C.suggest(name, Sound.names);
    out.warnings.push(what + ' there is no sound "' + name + '"' + (guess ? ", " + guess : ". The sounds are: " + Sound.names.join(", ") + "."));
  }

  // Her own function with this name, if it is one: a global function that isn't a block or one of
  // the browser's own.
  function ownFunction(name) {
    var fn = KEYWORDS.indexOf(name) < 0 && Toolbox.blocks.indexOf(name) < 0 ? GLOBAL[name] : null;
    return typeof fn === "function" && !/\{\s*\[native code\]\s*\}\s*$/.test(String(fn)) ? fn : null;
  }

  // Where a call is: its line in rules.js, or the name of her own function (its line can't be known).
  function placeOf(script, c) {
    return script.name ? "rules.js (inside your function " + script.name + "()): " : inRules(script.line && script.line + c.line - 1);
  }

  // Reads a script ({ fn, line }, or her own function { fn, name }) without running it (all
  // warnings): the names it shows, hides, asks about, plays and ends with, and the words it calls
  // that aren't blocks. Her own functions it calls get read too, each one once.
  function readScript(out, n, script, reading) {
    var calls = Toolbox.calls(script.fn);
    unknownCalls(script.fn, calls).forEach(function (c) {
      add(reading.unknown, c.name);
      out.warnings.push(placeOf(script, c) + c.name + "( isn't a block or a function of yours" +
        orGuess(c.name + "(", Toolbox.blocks.map(function (b) { return b + "("; })));
    });
    calls.forEach(function (c) {
      if (c.method) return;
      c.words.forEach(function (w) {
        var what = placeOf(script, c) + c.name + '("' + w + '"):';
        if (c.name === "show") add(reading.shown, w);
        if (c.name === "show" || c.name === "hide" || c.name === "isShown") unknownThing(out, n, what, w);
        if (c.name === "playSound") unknownSound(out, what, w);
        if (c.name === "endGame" && !has(ENDINGS, w) && !reading.endingsSaid[w]) {
          out.warnings.push(what + ' there is no ending "' + w + '" in index.html' + orGuess(w, ids(ENDINGS)));
        }
      });
      var own = !c.declared && ownFunction(c.name);
      if (own && reading.read.indexOf(own) < 0) {
        reading.read.push(own);
        readScript(out, n, { fn: own, name: c.name }, reading);
      }
    });
  }

  // A plain word where a danger needs a block (safe: "walk-in" instead of beIn("walk-in")).
  function notABlock(at, key, value, n) {
    var word = typeof value === "string" ? value : null;
    var room = isRoom(word), button = n.buttons.indexOf(word) >= 0;
    var block = key === "safe" ? (room ? "beIn" : button ? "click" : "") : (button ? "click" : room ? "anythingIn" : "");
    return at + " has " + key + ": " + JSON.stringify(value) + ", but a danger needs a block there" +
      (block ? ", did you mean " + block + '("' + word + '")?' : key === "safe" ? ": beIn(…), leaveRoom(…) or click(…)." : ": click(…) or anythingIn(…).");
  }

  // A danger from a rule's pretend run: its endings, its steps and deadly clicks, the names it
  // shows and hides, and whether its clicks are enough.
  function checkDanger(out, n, ev, d, shown) {
    var at = inRules(ev.line) + "the " + ev.time + " danger";
    function ending(what, id) {
      if (id !== undefined && !has(ENDINGS, id)) out.errors.push(at + what + ' "' + id + '", but there is no ending "' + id + '" in index.html' + orGuess(id, ids(ENDINGS)));
    }
    function room(what, r) {
      if (!isRoom(r)) out.errors.push(at + what + ': there is no room "' + r + '" in index.html' + orGuess(r, n.rooms));
      return isRoom(r);
    }
    ending(" has ending:", d.late);
    if (d.hold && d.hold.fatal !== d.late) ending("'s thenWait has ending:", d.hold.fatal);

    // how it ends: safe: (or thenWait:) and clicks:, or lasts:
    if (d.steps === undefined && d.endure === undefined) {
      out.errors.push(at + ' needs safe: … or lasts: …, or it never ends. Like safe: beIn("walk-in") (you\'re safe there) or lasts: 3 (it\'s over after 3 clicks).');
    }
    if (d.deadline !== undefined && d.late === undefined) {
      out.errors.push(at + " has clicks: " + d.deadline + ' but no ending: …, so nothing happens when the clicks run out. Add ending: "…" with the id of one of the endings in index.html.');
    }
    if (d.endure !== undefined && d.steps !== undefined) {
      out.warnings.push(at + " has lasts: and safe:, but with lasts: it's over after " + clicks(d.endure) + " whatever you do, so safe: does nothing. Take one of them out.");
    }
    if (d.endure !== undefined && d.hold) {
      out.warnings.push(at + " has lasts: and thenWait:, but with lasts: it's over after " + clicks(d.endure) + ", so thenWait: never happens. Take one of them out.");
    }

    (d.fatal || []).forEach(function (f) {
      if (!f || typeof f !== "object") return out.errors.push(notABlock(at, "deadly", f, n));
      var what = "'s deadly " + (f.hotspot !== undefined ? 'click("' + f.hotspot + '")' : 'anythingIn("' + f.room + '")');
      if (f.ending === undefined) {
        out.warnings.push(at + what + " has no ending, so " + (f.hotspot !== undefined ? 'clicking it does nothing. Add ending: "…" to the danger, or write click("' + f.hotspot + '", { ending: "…" }).' : 'touching things there does nothing. Add ending: "…" to the danger.'));
      }
      if (f.ending !== d.late) ending(what + " ends with", f.ending);
      if (f.room !== undefined && !room(what, f.room)) return;
      if (f.hotspot !== undefined && !(f.room !== undefined ? spotNamed(f.room, f.hotspot) : stepRooms(f).length)) {
        out.warnings.push(at + what + ': no button has the id or class "' + f.hotspot + '"' + (f.room !== undefined ? ' in the room "' + f.room + '"' : "") + orGuess(f.hotspot, n.buttons));
      }
    });

    var stuck = false;  // a step that can't be done: no use counting the clicks
    (d.steps || []).forEach(function (s) {
      if (!s || typeof s !== "object") { stuck = true; return out.errors.push(notABlock(at, "safe", s, n)); }
      var what = "'s safe " + (s.leave !== undefined ? "leaveRoom(" + JSON.stringify(s.leave) + ")" : s.hotspot !== undefined ? 'click("' + s.hotspot + '")' : "beIn(" + JSON.stringify(s.room) + ")");
      if (s.room === undefined && s.leave === undefined) {
        if (!stepRooms(s).length) {
          stuck = true;
          out.errors.push(at + what + ': no button has the id or class "' + s.hotspot + '"' + orGuess(s.hotspot, n.buttons));
        }
        return;
      }
      list(s.room !== undefined ? s.room : s.leave).forEach(function (r) {
        if (!room(what, r)) stuck = true;
        else if (s.hotspot && !spotNamed(r, s.hotspot)) {
          stuck = true;
          out.errors.push(at + what + ': the room "' + r + '" has no button with the id or class "' + s.hotspot + '"' + orGuess(s.hotspot, n.buttons));
        }
      });
    });

    var moments = [d.whenSafe].concat((d.steps || []).map(function (s) { return s && s.then; }), d.hold ? d.hold.steps : []);
    moments.forEach(function (m) {
      if (!m || typeof m !== "object") return;
      (m.show || []).forEach(function (name) { add(shown, name); unknownThing(out, n, at + ' shows "' + name + '", but', name); });
      (m.hide || []).forEach(function (name) { unknownThing(out, n, at + ' hides "' + name + '", but', name); });
      if (m.sound !== undefined) unknownSound(out, at + ' plays "' + m.sound + '", but', m.sound);
    });

    // are the clicks enough from the worst room to start in?
    if (!stuck && d.steps && d.deadline) {
      var worst = 0;
      startRooms(ev).forEach(function (r) {
        if (isRoom(r)) worst = Math.max(worst, C.shortest(r, d.steps));
      });
      if (!isFinite(worst)) {
        out.warnings.push(at + " can't be won from some rooms: its safe steps can never all be done. Check the rooms and the links between them in index.html.");
      } else if (d.deadline < worst) {
        out.warnings.push(at + " gives you " + clicks(d.deadline) + ", but the shortest way takes " + worst + ". Make it clicks: " + (worst + 1) + ", so there's a click to spare.");
      } else if (d.deadline === worst) {
        out.warnings.push(at + " gives you " + clicks(d.deadline) + ", and the shortest way takes all " + worst + ", with no click to spare. Make it clicks: " + (worst + 1) + ".");
      }
    }
  }

  // ---- where the buttons sit (style.css): only in a page ----

  // Shows each room for a moment, with the buttons that start hidden showing too, measures every
  // button against its picture, then puts it all back. That happens before the browser draws
  // anything, so you never see it.
  C.layout = function () {
    var warnings = [];
    if (typeof document === "undefined") return { warnings: warnings };
    var sections = document.querySelectorAll("section.room");
    for (var i = 0; i < sections.length; i++) measure(sections[i], warnings);
    return { warnings: warnings };
  };

  function measure(section, warnings) {
    var info = ROOM_INFO[section.id] || { hotspots: {} };
    var style = section.getAttribute("style");
    section.style.setProperty("display", "block", "important");
    var spots = [];
    for (var i = 0; i < section.children.length; i++) {
      var el = section.children[i];
      if (!/^(button|a)$/i.test(el.tagName) || !el.id) continue;
      var h = info.hotspots[el.id];
      spots.push({ el: el, id: "#" + el.id, wasHidden: el.hidden, startsHidden: !!(h && h.hidden) });
      el.hidden = false;
    }
    var stage = section.getBoundingClientRect();
    spots.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      s.left = r.left - stage.left; s.top = r.top - stage.top;
      s.right = r.right - stage.left; s.bottom = r.bottom - stage.top;
    });
    spots.forEach(function (s) { s.el.hidden = s.wasHidden; });
    if (style === null) section.removeAttribute("style"); else section.setAttribute("style", style);
    if (!stage.width || !stage.height) return;

    var placed = spots.filter(function (s) {
      var what = "style.css: the button " + s.id;
      if (s.right - s.left < 1 || s.bottom - s.top < 1) {
        warnings.push(what + " has no size, so you can't click it. Add " + s.id + " { left: …; top: …; width: …; height: …; } to style.css. If it's there already, look for a missing } above it.");
      } else if (s.right <= 0 || s.bottom <= 0 || s.left >= stage.width || s.top >= stage.height) {
        var missing = s.right <= 0 ? "left:" : s.bottom <= 0 ? "top:" : "";
        warnings.push(what + " is outside the picture. " + (missing ? "Did you forget " + missing + "? Look for a missing } above it, too." : "Its left: and top: must be less than 100%."));
      } else {
        var top = s.top / stage.height * 100;
        if (top > 87) warnings.push(what + " is too low (top: " + Math.round(top) + "%): the room buttons at the bottom of the screen cover it. Move it up, to top: 87% or less.");
        return true;
      }
      return false;
    });
    // Covered by a later one (it's on top). A button that starts hidden comes and goes with the
    // rules (door-open takes door-closed's place), so it never counts.
    placed.forEach(function (s, i) {
      if (s.startsHidden) return;
      placed.slice(i + 1).forEach(function (t) {
        if (!t.startsHidden && t.left <= s.left + 0.5 && t.top <= s.top + 0.5 && t.right >= s.right - 0.5 && t.bottom >= s.bottom - 0.5) {
          warnings.push("style.css: the button " + s.id + " is completely under " + t.id + " (it comes later in index.html, so it's on top), so you can never click " + s.id + ". Move or resize one of them.");
        }
      });
    });
  }

  return C;
})();
