// engine.js: the game machine. It keeps track of the clock, the room, the flags,
// the events and the dangers. It never draws anything (view.js does that), so the
// tests can play the whole game without a browser. You don't need to change this
// file: everything you'd want to change lives in story.js.

var Game = (function () {
  var SAVE_KEY = "babysitting-rules:save";
  var ENDINGS_KEY = "babysitting-rules:endings";
  var storageOn = true;
  var foundInMemory = [];
  var G = { state: null, checkpoint: null };

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

  function emptyResult() { return { texts: [], sounds: [], shake: false, ending: null }; }
  function copy(value) { return JSON.parse(JSON.stringify(value)); }

  function setFlags(list, on) {
    (list || []).forEach(function (name) {
      if (on) G.state.flags[name] = true;
      else delete G.state.flags[name];
    });
  }

  function eventById(id) {
    return EVENTS.filter(function (ev) { return ev.id === id; })[0] || null;
  }

  function overlayRoom() {
    return Object.keys(ROOM_INFO).filter(function (id) { return ROOM_INFO[id].overlay; })[0] || null;
  }

  function scene() {
    return G.state.camera ? overlayRoom() : G.state.room;
  }

  function hotspot(id) {
    var info = ROOM_INFO[scene()];
    return info && info.hotspots ? info.hotspots[id] : undefined;
  }

  function roomHas(roomId, name) {
    var svg = (typeof ROOMS !== "undefined" && ROOMS[roomId]) || "";
    return svg.indexOf('data-name="' + name + '"') >= 0 || svg.indexOf('data-hotspot="' + name + '"') >= 0;
  }

  function freshState() {
    return {
      time: parseTime(SETTINGS.startTime),
      room: SETTINGS.startRoom,
      camera: false,
      flags: {},
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

  // A save from before she edited story.js may name things that no longer exist.
  function validState(s) {
    if (!s || typeof s.time !== "number" || !ROOM_INFO[s.room] || !s.flags || !s.fired) return false;
    for (var id in s.fired) if (!eventById(id)) return false;
    if (s.danger && !(eventById(s.danger.id) || {}).danger) return false;
    if (s.ending && !ENDINGS[s.ending]) return false;
    return (s.notes || []).every(function (n) {
      return NOTES[n];
    });
  }

  function loadSave() {
    var data = readStore(SAVE_KEY);
    if (!data || !validState(data.state)) return null;
    if (data.checkpoint && !(validState(data.checkpoint.state) && eventById(data.checkpoint.eventId))) return null;
    if (data.state.ending && ENDINGS[data.state.ending].win) return null;
    return data;
  }

  function endingsFound() { return (readStore(ENDINGS_KEY) || foundInMemory).slice(); }

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

  function dangerDef() { return G.state.danger ? eventById(G.state.danger.id).danger : null; }

  function stepDone(step, act) {
    if (step.leave) return G.state.room !== step.leave;
    var rooms = [].concat(step.room);
    if (step.hotspot) return act.hotspot === step.hotspot && rooms.indexOf(act.room) >= 0;
    return rooms.indexOf(G.state.room) >= 0;
  }

  function resolve(r) {
    var safe = dangerDef().whenSafe || {};
    if (safe.text) r.texts.push(safe.text);
    setFlags(safe.setFlags, true);
    setFlags(safe.clearFlags, false);
    G.state.danger = null;
  }

  // Ticks off as many steps as this action finished; starts the hold or resolves at the end.
  function advanceSteps(r, act) {
    var d = G.state.danger;
    var D = dangerDef();
    while (d.step < D.steps.length && stepDone(D.steps[d.step], act)) {
      var step = D.steps[d.step];
      setFlags(step.setFlags, true);
      if (step.text) r.texts.push(step.text);
      d.step++;
      act = {};
    }
    if (d.step < D.steps.length) return false;
    if (D.hold) d.holding = true;
    else resolve(r);
    return true;
  }

  function startDanger(ev, r) {
    G.state.danger = { id: ev.id, used: 0, step: 0, held: 0, holding: false };
    if (ev.danger.steps) advanceSteps(r, {});
  }

  // Which ending (if any) a click on hotspot id in roomId causes during the danger.
  function fatalFor(id, roomId) {
    var list = dangerDef().fatal || [];
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      if (f.hotspot && f.hotspot !== id) continue;
      if (f.room && f.room !== roomId) continue;
      if (f.unlessFlag && G.state.flags[f.unlessFlag]) continue;
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
    var step = hold.steps[d.held] || {};
    if (step.text) r.texts.push(step.text);
    if (step.sound) r.sounds.push(step.sound);
    if (step.scare) r.shake = true;
    setFlags(step.setFlags, true);
    d.held++;
    if (d.held >= hold.steps.length) resolve(r);
  }

  // ---- events ----

  function due(ev) { return !G.state.fired[ev.id] && G.state.time >= parseTime(ev.time); }

  // Fires one event: checkpoint first, so "Try again" lands just before it.
  function fire(ev, r, byFallback) {
    G.checkpoint = { eventId: ev.id, state: copy(G.state) };
    G.state.fired[ev.id] = true;
    if (ev.unlessFlag && G.state.flags[ev.unlessFlag]) return;
    setFlags(ev.setFlags, true);
    setFlags(ev.clearFlags, false);
    var text = ev.room && ev.textAway && G.state.room !== ev.room ? ev.textAway : ev.text;
    var sound = ev.sound;
    if (byFallback) {
      text = ev.fallbackText || text;
      sound = ev.fallbackSound || sound;
    }
    if (text) r.texts.push(text);
    if (sound) r.sounds.push(sound);
    if (ev.scare) r.shake = true;
    if (ev.ending) endGame(ev.ending, r);
    else if (ev.danger) startDanger(ev, r);
  }

  // Runs after every action: fires whatever is due, in story order.
  // Nothing new starts while a danger runs; it all waits until the danger is over.
  function processEvents(r, entered) {
    for (var i = 0; i < EVENTS.length; i++) {
      var ev = EVENTS[i];
      if (G.state.ending || G.state.danger) return;
      if (!due(ev) || (ev.after && !G.state.fired[ev.after])) continue;
      var trigger = ev.trigger || "now";
      if (trigger === "now") {
        if (!(ev.notIn && ev.notIn.indexOf(G.state.room) >= 0)) fire(ev, r);
      } else if (trigger === "nextEntry") {
        if (entered && roomHas(G.state.room, ev.group)) fire(ev, r);
      } else if (trigger === "inRoom") {
        if (G.state.room === ev.room) fire(ev, r);
      } else if (trigger === "beam") {
        if (!G.state.armed[ev.id]) {
          G.state.armed[ev.id] = true;
          G.state.actionsHere = 0;
          setFlags(ev.armFlags, true);
        } else if (ev.fallback && roomHas(G.state.room, ev.group) && G.state.actionsHere >= ev.fallback) {
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
      if (ev.trigger === "beam" && ev.group === name && due(ev) && G.state.armed[ev.id]) {
        fire(ev, r);
        return after(r, true);
      }
    }
    return r;
  }

  // Edit mode: jump to a time. Earlier events count as done (their flags are
  // applied, but no texts, sounds or dangers); later ones will happen again.
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
        setFlags(ev.armFlags, true);
        setFlags(ev.setFlags, true);
        setFlags(ev.clearFlags, false);
        var safe = ev.danger && ev.danger.whenSafe;
        if (safe) {
          setFlags(safe.setFlags, true);
          setFlags(safe.clearFlags, false);
        }
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

  function click(id) {
    var r = emptyResult();
    var h = hotspot(id);
    if (G.state.ending || !h) return r;
    var room = G.state.room;
    var D = dangerDef();
    var ending = h.ending || (D && fatalFor(id, scene()));
    if (ending) {
      endGame(ending, r);
      save();
      return r;
    }
    // During a hold only leaving, or the things its labels name (the door), give you away.
    if (G.state.danger && G.state.danger.holding && !h.goTo && !(D.hold.labels || {})[id]) {
      r.texts.push(D.hold.keep || "Keep going...");
      return r;
    }
    if (breaksHold(r)) return r;
    var act = { hotspot: id, room: room };
    var minutes = h.minutes != null ? h.minutes : h.note ? 0 : h.goTo ? SETTINGS.moveMinutes : SETTINGS.lookMinutes;
    if (h.notBefore && G.state.time < parseTime(h.notBefore)) {
      r.texts.push(h.tooEarly);
      spend(minutes);
      return after(r, false, act);
    }
    var said = D && D.say && D.say[id];
    if (said || h.text) r.texts.push(said || h.text);
    if (h.note && G.state.notes.indexOf(h.note) < 0) G.state.notes.push(h.note);
    setFlags(h.setFlags, true);
    if (h.action === "camera") G.state.camera = true;
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

  function label(id) {
    var h = hotspot(id);
    if (!h) return "";
    var D = dangerDef();
    if (D && G.state.danger.holding && D.hold.labels && D.hold.labels[id]) return D.hold.labels[id];
    if (D && D.labels && D.labels[id]) return D.labels[id];
    return h.label;
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
  G.exits = function () { return (ROOM_INFO[G.state.room].exits || []).slice(); };
  G.clock = function () { return formatTime(G.state.time); };
  G.setFlag = function (name, on) { setFlags([name], on); };
  G.useStorage = function (on) { storageOn = on; };
  G.go = go;
  G.click = click;
  G.wait = wait;
  G.scene = scene;
  G.label = label;
  G.roomHas = roomHas;
  G.beamTouched = beamTouched;
  G.editJump = editJump;
  G.endingsFound = endingsFound;
  G.parseTime = parseTime;
  G.formatTime = formatTime;
  return G;
})();
