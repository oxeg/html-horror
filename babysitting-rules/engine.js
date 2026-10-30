// engine.js: the game machine. It keeps track of the clock, the room, what is shown
// or hidden, the events and the dangers. It never draws anything (view.js does that), so the
// tests can play the whole game without a browser. You don't need to change this
// file: everything you'd want to change lives in index.html and rules.js.

var Game = (function () {
  var SAVE_KEY = "babysitting-rules:save";
  var ENDINGS_KEY = "babysitting-rules:endings";
  var storageOn = true;
  var foundInMemory = [];
  var G = { state: null, checkpoint: null };
  // Endings found before they had readable names still count.
  var LEGACY_ENDINGS = {
    E1: "it-wasnt-her", E2: "mirror", E3: "open-door", E4: "not-the-cat", E5: "spin-cycle",
    E6: "sounds-like-us", E7: "nobody-there", E8: "lost-keys", E9: "forgot-her", W1: "home",
  };

  // ---- small helpers ----

  function parseTime(text) {
    var m = /^(\d\d):(\d\d)$/.exec(text || "");
    return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
  }

  function formatTime(minutes) {
    var h = Math.floor(minutes / 60) % 24;
    var m = minutes % 60;
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }

  function emptyResult() { return { texts: [], sounds: [], shake: false, ending: null, problems: [] }; }
  function copy(value) { return JSON.parse(JSON.stringify(value)); }

  function eventById(id) {
    return EVENTS.filter(function (ev) { return ev.id === id; })[0] || null;
  }

  // The camera, while it's open (state.camera is its room's id), else the room you're in.
  function scene() {
    return G.state.camera || G.state.room;
  }

  // The id of the hotspot a name points at in a room: the exact id first,
  // then the first hotspot whose "names" list has it.
  function findHotspot(roomId, name) {
    var info = ROOM_INFO[roomId];
    var all = info && info.hotspots;
    if (!all) return null;
    if (all[name]) return name;
    for (var id in all) if (namesOf(id, all[id]).indexOf(name) >= 0) return id;
    return null;
  }

  function hotspotId(name) { return findHotspot(scene(), name); }

  function namesOf(id, h) { return h.names || [id]; }

  function hotspot(name) {
    var id = hotspotId(name);
    return id ? ROOM_INFO[scene()].hotspots[id] : undefined;
  }

  // The value a map (labels, say) holds for the first of these names it knows.
  function byName(map, names) {
    for (var i = 0; i < names.length; i++) if (map && map[names[i]]) return map[names[i]];
    return undefined;
  }

  // Does this room have something with this name: a button, or a part of its drawing (data-name)?
  function roomHas(roomId, name) {
    if (findHotspot(roomId, name)) return true;
    var svg = (typeof ROOMS !== "undefined" && ROOMS[roomId]) || "";
    return svg.indexOf('data-name="' + name + '"') >= 0;
  }

  // ---- showing and hiding, by name ----

  function mark(list, on) {
    (list || []).forEach(function (name) { G.state.shown[name] = on; });
  }

  // The first of these names that was shown or hidden decides; if none was, the default does.
  function isVisible(names, hiddenByDefault) {
    for (var i = 0; i < names.length; i++) if (G.state.shown[names[i]] !== undefined) return G.state.shown[names[i]];
    return !hiddenByDefault;
  }

  // A drawing part follows the hotspot with its name in that room, or else its own data-hidden.
  function partVisible(roomId, name, hiddenAttr) {
    var id = findHotspot(roomId, name);
    var h = id && ROOM_INFO[roomId].hotspots[id];
    return h ? isVisible(namesOf(id, h), h.hidden) : isVisible([name], hiddenAttr);
  }

  // Is this name showing? What show/hide stored, else the first hotspot with that name,
  // else not if a drawing marks that part data-hidden, else yes.
  function isShown(name) {
    if (G.state.shown[name] !== undefined) return G.state.shown[name];
    for (var room in ROOM_INFO) {
      var id = findHotspot(room, name);
      if (id) return !ROOM_INFO[room].hotspots[id].hidden;
    }
    var drawings = typeof ROOMS !== "undefined" ? ROOMS : {};
    for (var d in drawings) {
      var tags = String(drawings[d]).match(/<[^>]+>/g) || [];
      for (var i = 0; i < tags.length; i++) {
        if (tags[i].indexOf('data-name="' + name + '"') >= 0 && /\sdata-hidden[\s>\/=]/.test(tags[i])) return false;
      }
    }
    return true;
  }

  // A moment: { text, sound, shake, show: [names], hide: [names] }. Without r it only shows and hides.
  function applyMoment(m, r) {
    if (!m) return;
    if (r && m.text) r.texts.push(m.text);
    if (r && m.sound) r.sounds.push(m.sound);
    if (r && m.shake) r.shake = true;
    mark(m.show, true);
    mark(m.hide, false);
  }

  function freshState() {
    return {
      time: parseTime(SETTINGS.startTime),
      room: SETTINGS.startRoom,
      camera: false,
      shown: {},
      dark: false,
      notes: [],
      fired: {},
      armed: {},
      actionsHere: 0,
      ending: null,
      danger: null,
    };
  }

  // ---- saving (every call is wrapped: the game must work without storage) ----

  function readStore(key) {
    try {
      return storageOn ? JSON.parse(localStorage.getItem(key) || "null") : null;
    } catch (e) {
      return null; // no storage or a broken save: play on without it
    }
  }

  function writeStore(key, value) {
    try {
      if (storageOn) localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {} // no storage: keep playing
  }

  function save() { writeStore(SAVE_KEY, { state: G.state, checkpoint: G.checkpoint }); }

  // A save from before she edited rules.js or index.html may name things that no longer exist.
  function validState(s) {
    if (!s || typeof s.time !== "number" || !ROOM_INFO[s.room] || !s.shown || !s.fired) return false;
    if (s.camera && !ROOM_INFO[s.camera]) return false;
    for (var id in s.fired) if (!eventById(id)) return false;
    if (s.danger && !(eventById(s.danger.id) && validDanger(s.danger.def))) return false;
    if (s.ending && !ENDINGS[s.ending]) return false;
    return (s.notes || []).every(function (n) {
      return NOTES[n];
    });
  }

  // A saved danger is its own definition: every ending it can lead to must still exist.
  function validDanger(def) {
    if (!def) return false;
    var endings = [def.late, def.hold && def.hold.fatal].concat((def.fatal || []).map(function (f) { return f.ending; }));
    return endings.every(function (e) { return e == null || ENDINGS[e]; });
  }

  function loadSave() {
    var data = readStore(SAVE_KEY);
    if (!data || !validState(data.state)) return null;
    if (data.checkpoint && !(validState(data.checkpoint.state) && eventById(data.checkpoint.eventId))) return null;
    if (data.state.ending && ENDINGS[data.state.ending].win) return null;
    return data;
  }

  function endingsFound() {
    var found = [];
    (readStore(ENDINGS_KEY) || foundInMemory).forEach(function (id) {
      if (!ENDINGS[id] && LEGACY_ENDINGS[id]) id = LEGACY_ENDINGS[id];
      if (ENDINGS[id] && found.indexOf(id) < 0) found.push(id);
    });
    return found;
  }

  function endGame(endingId, r) {
    G.state.ending = endingId;
    r.ending = endingId;
    if (ENDINGS[endingId] && ENDINGS[endingId].sound) r.sounds.push(ENDINGS[endingId].sound);
    var found = endingsFound();
    if (found.indexOf(endingId) < 0) found.push(endingId);
    foundInMemory = found;
    writeStore(ENDINGS_KEY, found);
  }

  // ---- dangers ----

  function dangerDef() { return G.state.danger ? G.state.danger.def : null; }

  // A click step with no room counts in any room.
  function stepDone(step, act) {
    if (step.leave) return G.state.room !== step.leave;
    var rooms = [].concat(step.room);
    var here = step.room === undefined || rooms.indexOf(act.room) >= 0;
    if (step.hotspot) return (act.names || []).indexOf(step.hotspot) >= 0 && here;
    return rooms.indexOf(G.state.room) >= 0;
  }

  function resolve(r) {
    applyMoment(dangerDef().whenSafe, r);
    G.state.danger = null;
  }

  // Ticks off as many steps as this action finished; starts the hold or resolves at the end.
  function advanceSteps(r, act) {
    var d = G.state.danger;
    var D = dangerDef();
    while (d.step < D.steps.length && stepDone(D.steps[d.step], act)) {
      applyMoment(D.steps[d.step].then, r);
      d.step++;
      act = {};
    }
    if (d.step < D.steps.length) return false;
    if (D.hold) d.holding = true;
    else resolve(r);
    return true;
  }

  function startDanger(id, def, r) {
    G.state.danger = { id: id, used: 0, step: 0, held: 0, holding: false, def: copy(def) };
    if (def.steps) advanceSteps(r, {});
  }

  // Which ending (if any) a click on a hotspot with these names in roomId causes during the danger.
  function fatalFor(names, roomId) {
    var list = dangerDef().fatal || [];
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      if (f.hotspot && names.indexOf(f.hotspot) < 0) continue;
      if (f.room && f.room !== roomId) continue;
      if (f.unlessShown && isShown(f.unlessShown)) continue;
      return f.ending;
    }
    return null;
  }

  // Counts one action against the danger running before it.
  function dangerTick(r, act) {
    var d = G.state.danger;
    var D = dangerDef();
    d.used++;
    if (D.endure) {
      if (d.used >= D.endure || (act.wait && D.waitEnds)) resolve(r);
      return;
    }
    if (!advanceSteps(r, act) && d.used >= D.deadline) endGame(D.late, r);
  }

  function holdStep(r) {
    var d = G.state.danger;
    var hold = dangerDef().hold;
    applyMoment(hold.steps[d.held], r);
    d.held++;
    if (d.held >= hold.steps.length) resolve(r);
  }

  // ---- events ----

  function due(ev) { return !G.state.fired[ev.id] && G.state.time >= parseTime(ev.time); }

  // Fires one event: checkpoint first, so "Try again" lands just before it.
  // A rule from rules.js runs its script; its ending or danger comes back from the toolbox.
  function fire(ev, r, byFallback) {
    G.checkpoint = { eventId: ev.id, state: copy(G.state) };
    G.state.fired[ev.id] = true;
    if (ev.run) {
      var out = Toolbox.run(ev.run, { r: r, byFallback: !!byFallback });
      if (out.ending) endGame(out.ending, r);
      else if (out.danger) startDanger(ev.id, out.danger, r);
      return;
    }
    if (ev.unlessShown && isShown(ev.unlessShown)) return;
    if (ev.lightsOut) G.state.dark = true;
    var text = ev.room && ev.textAway && G.state.room !== ev.room ? ev.textAway : ev.text;
    var sound = ev.sound;
    if (byFallback) {
      text = ev.fallbackText || text;
      sound = ev.fallbackSound || sound;
    }
    applyMoment({ text: text, sound: sound, shake: ev.scare, show: ev.show, hide: ev.hide }, r);
    if (ev.ending) endGame(ev.ending, r);
    else if (ev.danger) startDanger(ev.id, ev.danger, r);
  }

  // Runs after every action: fires whatever is due, in time order.
  // Nothing new starts while a danger runs; it all waits until the danger is over.
  function processEvents(r, entered) {
    for (var i = 0; i < EVENTS.length; i++) {
      var ev = EVENTS[i];
      if (G.state.ending || G.state.danger) return;
      if (!due(ev) || (ev.after && !G.state.fired[ev.after])) continue;
      var trigger = ev.trigger || "now";
      var blocked = !!ev.notIn && ev.notIn.indexOf(G.state.room) >= 0;
      if (blocked && trigger !== "beam") continue;
      if (trigger === "now") {
        fire(ev, r);
      } else if (trigger === "nextEntry") {
        if (entered && roomHas(G.state.room, ev.group)) fire(ev, r);
      } else if (trigger === "inRoom") {
        if (G.state.room === ev.room) fire(ev, r);
      } else if (trigger === "beam") {
        if (!G.state.armed[ev.id]) {
          G.state.armed[ev.id] = true;
          G.state.actionsHere = 0;
          mark(ev.armShow, true);
        } else if (!blocked && ev.fallback && roomHas(G.state.room, ev.group) && G.state.actionsHere >= ev.fallback) {
          fire(ev, r, true);
        }
      }
    }
  }

  // Everything that happens after an action: danger counting, then events, then saving.
  function after(r, entered, act) {
    if (!entered) G.state.actionsHere++;
    if (G.state.danger && act && !G.state.ending) dangerTick(r, act);
    processEvents(r, entered);
    save();
    return r;
  }

  function beamTouched(name) {
    var r = emptyResult();
    if (G.state.ending || G.state.danger) return r;
    for (var i = 0; i < EVENTS.length; i++) {
      var ev = EVENTS[i];
      if (ev.trigger === "beam" && ev.group === name && due(ev) && G.state.armed[ev.id]
          && !(ev.notIn && ev.notIn.indexOf(G.state.room) >= 0)) {
        fire(ev, r);
        return after(r, true);
      }
    }
    return r;
  }

  // Edit mode: jump to a time. Earlier events count as done (what they show and hide
  // is applied, but no texts, sounds or dangers; scripts run in silent mode); later ones
  // will happen again.
  function editJump(roomId, time) {
    var t = parseTime(time);
    var s = G.state;
    s.time = t;
    s.room = roomId;
    s.camera = false;
    s.danger = null;
    s.ending = null;
    s.actionsHere = 0;
    EVENTS.forEach(function (ev) {
      if (parseTime(ev.time) < t) {
        if (s.fired[ev.id]) return;
        s.fired[ev.id] = true;
        mark(ev.armShow, true);
        if (ev.run) {
          var out = Toolbox.run(ev.run, { r: emptyResult(), silent: true });
          return applyMoment(out.danger && out.danger.whenSafe);
        }
        if (ev.lightsOut) s.dark = true;
        applyMoment(ev);
        applyMoment(ev.danger && ev.danger.whenSafe);
      } else {
        delete s.fired[ev.id];
        delete s.armed[ev.id];
      }
    });
    save();
  }

  // ---- the player's actions ----

  function enter(roomId) {
    G.state.room = roomId;
    G.state.camera = false;
    G.state.actionsHere = 0;
  }

  function spend(minutes) {
    if (!G.state.danger) G.state.time += minutes; // the clock stops during a danger
  }

  // During a hold (counting, waiting it out) anything except Wait is fatal.
  function breaksHold(r) {
    if (!(G.state.danger && G.state.danger.holding)) return false;
    endGame(dangerDef().hold.fatal, r);
    save();
    return true;
  }

  function go(roomId) {
    var r = emptyResult();
    if (G.state.ending) return r;
    if ((ROOM_INFO[G.state.room].exits || []).indexOf(roomId) < 0) return r;
    if (breaksHold(r)) return r;
    enter(roomId);
    spend(SETTINGS.moveMinutes);
    return after(r, true, {});
  }

  function click(name) {
    var r = emptyResult();
    var id = hotspotId(name);
    var h = id && hotspot(id);
    if (G.state.ending || !h || !isVisible(namesOf(id, h), h.hidden)) return r;  // you can't use what you can't see
    var names = namesOf(id, h);
    var room = G.state.room;
    var act = { hotspot: id, names: names, room: room };
    var D = dangerDef();
    // A click that does the danger's next safe step is never deadly.
    var next = D && D.steps && D.steps[G.state.danger.step];
    var safeStep = !!(next && next.hotspot && stepDone(next, act));
    var ending = h.ending || (D && !safeStep && fatalFor(names, scene()));
    if (ending) {
      endGame(ending, r);
      save();
      return r;
    }
    // During a hold only leaving, or the things its labels name (the door), give you away.
    if (G.state.danger && G.state.danger.holding && !h.goTo && !byName(D.hold.labels, names)) {
      r.texts.push(D.hold.keep || "Keep going...");
      return r;
    }
    if (breaksHold(r)) return r;
    var minutes = h.minutes != null ? h.minutes : h.note ? 0 : h.goTo ? SETTINGS.moveMinutes : SETTINGS.lookMinutes;
    if (h.notBefore && G.state.time < parseTime(h.notBefore)) {
      r.texts.push(h.tooEarly);
      spend(minutes);
      return after(r, false, act);
    }
    if (h.note && G.state.notes.indexOf(h.note) < 0) G.state.notes.push(h.note);
    // A whenClicked script runs here. The button's own text shows unless the script said
    // something. A danger from a click is ignored.
    var out = h.run ? Toolbox.run(h.run, { r: r }) : {};
    applyMoment({ text: out.said ? null : (D && byName(D.say, names)) || h.text, show: h.show, hide: h.hide }, r);
    if (out.ending) {
      endGame(out.ending, r);
      save();
      return r;
    }
    if (h.camera) G.state.camera = h.camera;
    if (h.goTo) enter(h.goTo);
    spend(minutes);
    return after(r, !!h.goTo, act);
  }

  function wait() {
    var r = emptyResult();
    if (G.state.ending) return r;
    if (G.state.danger && G.state.danger.holding) {
      holdStep(r);
      return after(r, false, null);
    }
    spend(SETTINGS.waitMinutes);
    return after(r, false, { wait: true });
  }

  // ---- what the view asks ----

  function label(name) {
    var id = hotspotId(name);
    if (!id) return "";
    var names = namesOf(id, hotspot(id));
    var D = dangerDef();
    var held = D && G.state.danger.holding && D.hold.labels ? byName(D.hold.labels, names) : null;
    return held || (D && byName(D.labels, names)) || hotspot(id).label;
  }

  // ---- what the view (and the tests) can call ----

  G.newGame = function () {
    G.state = freshState();
    G.checkpoint = null;
    return after(emptyResult(), true);
  };
  G.startOver = G.newGame;
  G.tryAgain = function () {
    if (!G.checkpoint) return G.newGame();
    var r = emptyResult();
    G.state = copy(G.checkpoint.state);
    fire(eventById(G.checkpoint.eventId), r);
    return after(r, true);
  };
  G.continueGame = function () {
    var data = loadSave();
    if (data) {
      G.state = data.state;
      G.checkpoint = data.checkpoint;
    }
    return !!data;
  };
  G.closeCamera = function () {
    G.state.camera = false;
    save();
  };
  G.waitLabel = function () {
    var D = dangerDef();
    return D && G.state.danger.holding ? D.hold.button : "Wait";
  };
  G.dangerLevel = function () {
    var D = dangerDef();
    return D && D.deadline && !G.state.danger.holding ? G.state.danger.used / D.deadline : 0;
  };
  G.hasSave = function () { return !!loadSave(); };
  G.freshState = freshState;
  G.exits = function () { return (ROOM_INFO[G.state.room].exits || []).slice(); };
  G.clock = function () { return formatTime(G.state.time); };
  G.setShown = function (name, on) { G.state.shown[name] = !!on; };
  G.setDark = function (on) { G.state.dark = !!on; };
  G.isShown = isShown;
  G.isVisible = isVisible;
  G.partVisible = partVisible;
  G.useStorage = function (on) { storageOn = on; };
  G.go = go;
  G.click = click;
  G.wait = wait;
  G.scene = scene;
  G.label = label;
  G.roomHas = roomHas;
  G.findHotspot = findHotspot;
  G.beamTouched = beamTouched;
  G.editJump = editJump;
  G.endingsFound = endingsFound;
  G.parseTime = parseTime;
  G.formatTime = formatTime;
  return G;
})();
