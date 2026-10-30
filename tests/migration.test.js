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
// drop the words, and the words are what this compares.) `before` can set the scene first;
// show and hide are what the script itself changed.
function newDoes(script, time, room, byFallback, before) {
  Game.newGame();
  Game.state.room = room;
  Game.state.shown = {};
  Game.state.dark = false;
  if (before) before();
  Game.state.time = Game.parseTime(time);
  var start = JSON.parse(JSON.stringify(Game.state.shown));
  var r = { texts: [], sounds: [], shake: false, problems: [] };
  var out = Toolbox.run(script, { r: r, silent: false, byFallback: byFallback });
  var shown = Game.state.shown;
  var changed = Object.keys(shown).sort().filter(function (n) { return shown[n] !== start[n]; });
  var does = {
    texts: r.texts.map(capitalize), sounds: r.sounds, shake: r.shake,
    show: changed.filter(function (n) { return shown[n] === true; }),
    hide: changed.filter(function (n) { return shown[n] === false; }),
    dark: Game.state.dark, ending: out.ending,
  };
  Game.newGame();
  return { does: does, danger: out.danger, problems: r.problems };
}

// ---- the danger, compared piece by piece ----
//
// Not a literal "every string in the def" comparison: on purpose, the new rules drop some old
// strings and rename others. Rule 4b's old steps name their rooms ("sister-room", "bath",
// "bath-washer") and its deadly lock has unlessShown "bed-empty" (the next safe step beats a deadly
// click now), and rule 3's "lock" is now "bath-lock" / "laundry-lock". So every step, deadly piece,
// label and buttonSays key is compared by where it points, in old ids, and every moment field by
// field, in order, with the step it belongs to.

// A moment as the player gets it.
function moment(m) {
  if (!m) return null;
  return {
    text: capitalize(m.text) || null, sound: m.sound || null, shake: !!m.shake,
    show: (m.show || []).slice().sort(), hide: (m.hide || []).slice().sort(),
  };
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

// Where you are while you wait: wherever the old danger's last safe step leaves you.
function waitRooms(def) {
  var steps = (def && def.steps) || [];
  var last = steps[steps.length - 1];
  if (!last) return null;
  if (!last.hotspot) return [].concat(last.room);
  return target(last, false, "step").map(function (t) {
    var at = t.split("/");
    return ROOM_INFO[at[0]].hotspots[at[1]].goTo || at[0];
  });
}

// A labels or buttonSays map as [where each key points, its words] pairs. With `within`, only the
// buttons in those rooms count.
function pairs(map, isNew, within) {
  return Object.keys(map || {}).map(function (key) {
    var at = target({ hotspot: key }, isNew, "step").filter(function (t) {
      return !within || within.indexOf(t.split("/")[0]) >= 0;
    });
    return [at, capitalize(map[key])];
  }).sort(function (a, b) { return JSON.stringify(a) < JSON.stringify(b) ? -1 : 1; });
}

// The wait's labels: within the rooms where you wait they must point at exactly what the old ones
// did (dangerShape checks that), and nowhere outside the old targets. Rule 3's "lock" narrows to
// "bath-lock" because you wait locked in the bath.
function holdLabelsOnlyNarrow(newDef, oldDef, where) {
  var olds = pairs((oldDef.hold || {}).labels, false);
  pairs((newDef.hold || {}).labels, true).forEach(function (p) {
    var o = olds.filter(function (q) { return q[1] === p[1]; })[0];
    ok(o && p[0].length && p[0].every(function (t) { return o[0].indexOf(t) >= 0; }),
      where + ": the wait label " + JSON.stringify(p) + " points at something the old one didn't");
  });
}

function dangerShape(def, isNew, waitAt) {
  if (!def) return null;
  function ending(id) { return isNew ? id : renamed(RENAMES.endings, id); }
  var hold = def.hold;
  return {
    deadline: def.deadline, late: ending(def.late), endure: def.endure, waitEnds: def.waitEnds,
    steps: (def.steps || []).map(function (s) { return { at: target(s, isNew, "step"), then: moment(s.then) }; }),
    deadly: (def.fatal || []).map(function (f) { return { at: target(f, isNew, "deadly"), ending: ending(f.ending) }; }),
    labels: pairs(def.labels, isNew), buttonSays: pairs(def.say, isNew),
    hold: hold ? {
      button: hold.button, steps: (hold.steps || []).map(moment), labels: pairs(hold.labels, isNew, waitAt),
      otherClicks: capitalize(hold.keep) || null, ending: ending(hold.fatal),
    } : null,
    whenSafe: moment(def.whenSafe),
  };
}

// The old hotspot whose click shows this name, and its id: { id, spot }.
function clickThatShows(name) {
  for (var room in ROOM_INFO) {
    for (var id in ROOM_INFO[room].hotspots) {
      var spot = ROOM_INFO[room].hotspots[id];
      if ((spot.show || []).indexOf(name) >= 0) return { id: id, spot: spot };
    }
  }
  return null;
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
    var waitAt = waitRooms(ev.danger);
    roomsFor(ev).forEach(function (room, i) {
      [false, true].forEach(function (byFallback) {
        var where = ev.id + " in " + room + (byFallback ? " (by the clicks)" : " (by the light)");
        var got = newDoes(rule.run, rule.time, room, byFallback);
        eq(got.problems, [], where + " problems");
        eq(got.does, oldDoes(ev, i === 0, byFallback), where);
        eq(dangerShape(got.danger, true, waitAt), dangerShape(ev.danger, false, waitAt), where + " danger");
        if (got.danger) holdLabelsOnlyNarrow(got.danger, ev.danger, where);
      });
    });

    // An event with unlessShown also has the branch where it does nothing: first the click that
    // shows that thing (tucking your sister in), and then neither the old event nor the new
    // script may say or change anything.
    if (ev.unlessShown) {
      var tuck = clickThatShows(ev.unlessShown);
      ok(tuck, "no old hotspot shows " + ev.unlessShown);
      var skipped = newDoes(rule.run, rule.time, roomsFor(ev)[0], false, function () {
        Game.state.time = Game.parseTime(tuck.spot.notBefore || rule.time);
        Toolbox.run(Toolbox.clickScripts()[tuck.id].run, { r: { texts: [], sounds: [], problems: [] } });
        ok(Game.isShown(ev.unlessShown), "after clicking " + tuck.id + ", " + ev.unlessShown + " shows, so the old event skips");
      });
      eq(skipped.problems, [], ev.id + " after " + tuck.id + " problems");
      eq(skipped.does, { texts: [], sounds: [], shake: false, show: [], hide: [], dark: false, ending: null }, ev.id + " after " + tuck.id);
      eq(skipped.danger, null, ev.id + " after " + tuck.id + " danger");
    }
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

// ---- the content: index.html against the old ROOM_INFO, NOTES and ENDINGS ----

// Her HTML spells & as &amp; and may spell " as &quot;; the old story wrote them plainly.
function decoded(text) {
  return String(text === undefined ? "" : text).replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}
function collapsed(text) { return decoded(text).replace(/\s+/g, " ").trim(); }

// A note's words without its tags. The old fridge note numbered its rules by hand ("1. ") and had
// "Mom & Dad" on the heading's line after a comma; the new note numbers them with <ol> and gives
// "Mom & Dad" a line of its own.
function noteWords(html, isOld) {
  var text = String(html);
  if (isOld) text = text.replace(/<\/b>, /, "</b> ").replace(/(^|<br>)\s*\d+\. /g, "$1");
  return collapsed(text.replace(/<[^>]+>/g, " "));
}

// An ending's text is one <p> in the HTML; the old story had the same words without it. The HTML
// starts a new source line after each <br>, which shows the same (a line never starts with a space).
function endingWords(html) { return collapsed(String(html).replace(/<\/?p>/g, "")).replace(/<br> /g, "<br>"); }

test("the HTML says every word the old story said", function () {
  var w = Loader.build(minidom(INDEX_HTML).body);
  var camera = Object.keys(ROOM_INFO).filter(function (id) { return ROOM_INFO[id].overlay; })[0];

  eq(Object.keys(w.rooms).sort(), Object.keys(ROOM_INFO).sort(), "rooms");
  Object.keys(ROOM_INFO).forEach(function (room) {
    var old = ROOM_INFO[room];
    var now = w.rooms[room];
    eq({ name: capitalize(now.name), exits: now.exits, overlay: now.overlay },
      { name: capitalize(old.name), exits: old.exits, overlay: !!old.overlay }, room);
    eq(Object.keys(now.hotspots).sort(),
      Object.keys(old.hotspots).map(function (id) { return newNames(room, id)[0]; }).sort(), room + " buttons");
    // tooEarly and notBefore (sister-awake) live in rules.js, so they aren't compared here.
    Object.keys(old.hotspots).forEach(function (id) {
      var o = old.hotspots[id];
      var n = now.hotspots[newNames(room, id)[0]];
      eq({
        names: n.names, label: capitalize(n.label), text: capitalize(collapsed(n.text)), hidden: n.hidden,
        note: n.note, ending: n.ending, goTo: n.goTo, minutes: n.minutes, camera: n.camera,
      }, {
        names: newNames(room, id), label: capitalize(o.label), text: capitalize(collapsed(o.text)), hidden: !!o.hidden,
        note: renamed(RENAMES.notes, o.note), ending: renamed(RENAMES.endings, o.ending), goTo: o.goTo,
        minutes: o.minutes, camera: o.action === "camera" ? camera : undefined,
      }, room + "/" + id);
    });
  });

  eq(Object.keys(w.notes).sort(), Object.keys(NOTES).map(function (id) { return renamed(RENAMES.notes, id); }).sort(), "notes");
  Object.keys(NOTES).forEach(function (id) {
    var n = w.notes[renamed(RENAMES.notes, id)];
    eq({ words: noteWords(n.html), fake: n.fake }, { words: noteWords(NOTES[id].text, true), fake: NOTES[id].look === "fake" }, "note " + id);
  });

  eq(Object.keys(w.endings).sort(), Object.keys(ENDINGS).map(function (id) { return renamed(RENAMES.endings, id); }).sort(), "endings");
  Object.keys(ENDINGS).forEach(function (id) {
    var o = ENDINGS[id];
    var e = w.endings[renamed(RENAMES.endings, id)];
    eq({ title: e.title, text: endingWords(e.text), win: e.win, sound: e.sound },
      { title: o.title, text: endingWords(o.text), win: !!o.win, sound: o.sound }, "ending " + id);
  });
});
