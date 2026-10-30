// Migration only (Task 14 deletes it): the draft rules.js must say and do exactly what the frozen
// old story (tests/fixtures/old-story.js) says and does, through the RENAMES tables.
// The engine here runs on the OLD world (its ROOM_INFO and EVENTS); the new scripts run beside it.

// The view makes the first letter big ("your sister…" pops up as "Your sister…"), so both sides do.
function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function renamed(map, id) {
  return id === undefined ? undefined : map[id] || id;
}

function newRule(oldId) {
  return Toolbox.rules().filter(function (r) { return r.id === RENAMES.rules[oldId]; })[0];
}

// The rooms to try a script in: the event's room (or the start room) and somewhere else.
function roomsFor(ev) {
  var here = ev.room || SETTINGS.startRoom;
  return [here, here === "entrance" ? "my-room" : "entrance"];
}

// What the old event did in one variant, worked out the way the old fire() did it.
function oldDoes(ev, here, byFallback) {
  var text = ev.room && ev.textAway && !here ? ev.textAway : ev.text;
  var sound = ev.sound;
  if (byFallback) {
    text = ev.fallbackText || text;
    sound = ev.fallbackSound || sound;
  }
  return {
    texts: text ? [capitalize(text)] : [], sounds: sound ? [sound] : [], shake: !!ev.scare,
    show: (ev.show || []).slice().sort(), hide: (ev.hide || []).slice().sort(),
    dark: !!ev.lightsOut, ending: renamed(RENAMES.endings, ev.ending) || null,
  };
}

// What a new script does in one variant: it runs into a scratch result, at its own time, on a
// fresh state that is thrown away afterwards, so nothing reaches the game. (Silent mode would
// drop the words, and the words are what this compares.)
function newDoes(script, time, room, byFallback) {
  Game.newGame();
  Game.state.room = room;
  Game.state.time = Game.parseTime(time);
  Game.state.shown = {};
  Game.state.dark = false;
  var r = { texts: [], sounds: [], shake: false, problems: [] };
  var out = Toolbox.run(script, { r: r, silent: false, byFallback: byFallback });
  var shown = Game.state.shown;
  var names = Object.keys(shown).sort();
  var does = {
    texts: r.texts.map(capitalize), sounds: r.sounds, shake: r.shake,
    show: names.filter(function (n) { return shown[n] === true; }),
    hide: names.filter(function (n) { return shown[n] === false; }),
    dark: Game.state.dark, ending: out.ending,
  };
  Game.newGame();
  return { does: does, danger: out.danger, problems: r.problems };
}

// ---- the danger, compared piece by piece ----
//
// Not a literal "every string in the def" multiset: on purpose, the new rules drop some old strings
// and rename others. Rule 4b's old steps name their rooms ("sister-room", "bath", "bath-washer") and
// its deadly lock has unlessShown "bed-empty" (the next safe step beats a deadly click now), and rule
// 3's "lock" is now "bath-lock" / "laundry-lock". So: the words and names that carry over are
// compared as a multiset, the endings after renaming, and every step and deadly click by where it
// points, in old ids.

var WORDS = { text: true, keep: true, button: true, sound: true };   // these keys' strings
var EVERY_VALUE = { show: true, hide: true, labels: true, say: true }; // every string inside these

// The multiset also counts every moment's shake, as "(shake)".
function words(value, key, out) {
  if (typeof value === "string") {
    if (WORDS[key] || EVERY_VALUE[key]) out.push(capitalize(value));
  } else if (key === "shake") {
    if (value) out.push("(shake)");
  } else if (value && typeof value === "object") {
    for (var k in value) words(value[k], Array.isArray(value) || EVERY_VALUE[key] ? key : k, out);
  }
  return out;
}

// A hotspot's names in the new world: a renamed one keeps its old id as its class.
function newNames(room, id) {
  var to = (RENAMES.hotspots[room] || {})[id];
  return to ? [to, id] : [id];
}

// Where a step or a deadly piece points, in old ids: "in <rooms>", "leave <room>",
// "anything in <room>", or every "<room>/<old hotspot id>" a click on it can be.
function target(p, isNew, kind) {
  if (p.leave) return ["leave " + p.leave];
  var rooms = p.room === undefined ? Object.keys(ROOM_INFO) : [].concat(p.room);
  if (!p.hotspot) return [(kind === "step" ? "in " : "anything in ") + rooms.slice().sort().join("+")];
  var out = [];
  rooms.forEach(function (room) {
    Object.keys(ROOM_INFO[room].hotspots).forEach(function (id) {
      if ((isNew ? newNames(room, id) : [id]).indexOf(p.hotspot) >= 0) out.push(room + "/" + id);
    });
  });
  return out.sort();
}

function dangerShape(def, isNew) {
  if (!def) return null;
  function ending(id) { return isNew ? id : renamed(RENAMES.endings, id); }
  var hold = def.hold || {};
  return {
    deadline: def.deadline, late: ending(def.late), endure: def.endure, waitEnds: def.waitEnds,
    steps: (def.steps || []).length,
    holdButton: hold.button, holdSteps: (hold.steps || []).length, holdEnding: ending(hold.fatal),
    stepTargets: (def.steps || []).map(function (s) { return target(s, isNew, "step"); }),
    deadly: (def.fatal || []).map(function (f) { return target(f, isNew, "deadly").concat("ends " + ending(f.ending)); }),
    words: words(def, "", []).sort(),
  };
}

// ---- the tests ----

test("every old event has a new rule, and no rule is extra", function () {
  eq(EVENTS.map(function (ev) { return ev.id; }).sort(), Object.keys(RENAMES.rules).sort());
  eq(Toolbox.rules().map(function (r) { return r.id; }).sort(),
    Object.keys(RENAMES.rules).map(function (id) { return RENAMES.rules[id]; }).sort());
});

EVENTS.forEach(function (ev) {
  test("every rule says the same words, with the same numbers: " + ev.id, function () {
    Game.useStorage(false);
    var rule = newRule(ev.id);
    ok(rule, "no rule at " + RENAMES.rules[ev.id]);

    // The trigger. An old "now" event's room (rule 5) only chose textAway; the new rule asks
    // youAreIn() instead, which the room variants below check. So room counts only for "inRoom".
    eq({
      trigger: rule.trigger, group: rule.group || null, room: rule.room || null, fallback: rule.fallback || null,
      notIn: rule.notIn, after: rule.after || null, armShow: rule.armShow,
    }, {
      trigger: ev.trigger || "now", group: ev.group || null, room: (ev.trigger === "inRoom" && ev.room) || null,
      fallback: ev.fallback || null, notIn: ev.notIn || [], after: renamed(RENAMES.rules, ev.after) || null,
      armShow: ev.armShow || [],
    }, ev.id + " trigger");

    // What it does, in the event's room and elsewhere, found by the light and by the clicks.
    roomsFor(ev).forEach(function (room, i) {
      [false, true].forEach(function (byFallback) {
        var where = ev.id + " in " + room + (byFallback ? " (by the clicks)" : " (by the light)");
        var got = newDoes(rule.run, rule.time, room, byFallback);
        eq(got.problems, [], where + " problems");
        eq(got.does, oldDoes(ev, i === 0, byFallback), where);
        eq(dangerShape(got.danger, true), dangerShape(ev.danger, false), where + " danger");
      });
    });
  });
});

test("the sister-awake script does what the old hotspot did", function () {
  Game.useStorage(false);
  var h = ROOM_INFO["sister-room"].hotspots["sister-awake"];
  var run = Toolbox.clickScripts()["sister-awake"].run;
  // the only old hotspot that did more than its plain data (show, hide, notBefore)
  var busy = [];
  Object.keys(ROOM_INFO).forEach(function (room) {
    Object.keys(ROOM_INFO[room].hotspots).forEach(function (id) {
      var spot = ROOM_INFO[room].hotspots[id];
      if (spot.show || spot.hide || spot.notBefore) busy.push(id);
    });
  });
  eq(Object.keys(Toolbox.clickScripts()), busy);
  eq(busy, ["sister-awake"]);
  var early = Game.formatTime(Game.parseTime(h.notBefore) - 10);
  eq(newDoes(run, early, "sister-room", false).does,
    { texts: [capitalize(h.tooEarly)], sounds: [], shake: false, show: [], hide: [], dark: false, ending: null }, "too early");
  eq(newDoes(run, h.notBefore, "sister-room", false).does,
    { texts: [capitalize(h.text)], sounds: [], shake: false, show: h.show.slice().sort(), hide: h.hide.slice().sort(), dark: false, ending: null },
    "at " + h.notBefore);
});
