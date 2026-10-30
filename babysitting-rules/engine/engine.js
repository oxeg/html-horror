// engine.js: the game machine. It keeps track of the clock, the room, what is shown
// or hidden, the events and the dangers. It never draws anything (view.js does that), so the
// tests can play the whole game without a browser. You don't need to change this
// file: everything you'd want to change lives in index.html and rules.js.

var Game = (function () {
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
  // else not if a drawing marks that part data-hidden (loader.js finds those), else yes.
  function isShown(name) {
    if (G.state.shown[name] !== undefined) return G.state.shown[name];
    for (var room in ROOM_INFO) {
      var id = findHotspot(room, name);
      if (id) return !ROOM_INFO[room].hotspots[id].hidden;
    }
    var hidden = typeof Loader !== "undefined" ? Loader.hiddenInDrawings() : [];
    return hidden.indexOf(name) < 0;
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

  // A new night: its times and skips are rolled (toolbox.js), unless a test gives one.
  function freshState(night) {
    return {
      night: night || Toolbox.rollNight(EVENTS),
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

  // save.js keeps the game between visits: it saves after every action and remembers the endings.
  function save() { G.saveNow(); }

  function endGame(endingId, r) {
    G.state.ending = endingId;
    r.ending = endingId;
    if (ENDINGS[endingId] && ENDINGS[endingId].sound) r.sounds.push(ENDINGS[endingId].sound);
    G.rememberEnding(endingId);
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
  // A danger with no steps (check.js says it needs some) is over at once.
  function advanceSteps(r, act) {
    var d = G.state.danger;
    var D = dangerDef();
    var steps = D.steps || [];
    while (d.step < steps.length && stepDone(steps[d.step], act)) {
      applyMoment(steps[d.step].then, r);
      d.step++;
      act = {};
    }
    if (d.step < steps.length) return false;
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

  // Due at tonight's time; a rule skipped tonight never is.
  function due(ev) { var t = Toolbox.tonight(ev, G.state); return !G.state.fired[ev.id] && t !== null && G.state.time >= t; }

  // Fires one event: checkpoint first, so "Try again" lands just before it.
  // Every event is a rule from rules.js: it runs its script, and its ending or danger comes back
  // from the toolbox.
  function fire(ev, r, byFallback) {
    G.checkpoint = { eventId: ev.id, state: copy(G.state) };
    G.state.fired[ev.id] = true;
    var out = Toolbox.run(ev.run, { r: r, byFallback: !!byFallback });
    if (out.ending) endGame(out.ending, r);
    else if (out.danger) startDanger(ev.id, out.danger, r);
  }

  // Runs after every action: fires whatever is due, in tonight's order. A rule after one that is
  // skipped tonight doesn't wait for it. Nothing new starts while a danger runs; it all waits.
  function processEvents(r, entered) {
    var events = Toolbox.inTonightsOrder(EVENTS, G.state);
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      if (G.state.ending || G.state.danger) return;
      if (!due(ev) || (ev.after && !G.state.fired[ev.after] && G.state.night[ev.after] !== null)) continue;
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

  // Edit mode: jump to a time. Events earlier tonight count as done (what they show and hide
  // is applied, but no texts, sounds or dangers; scripts run in silent mode); later ones, and
  // ones after a rule that is later tonight, will happen again. Skipped ones stay skipped.
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
      var tonight = Toolbox.earliest(ev, s, EVENTS);
      if (tonight === null) return;
      if (tonight < t) {
        if (s.fired[ev.id]) return;
        s.fired[ev.id] = true;
        mark(ev.armShow, true);
        var out = Toolbox.run(ev.run, { r: emptyResult(), silent: true });
        applyMoment(out.danger && out.danger.whenSafe);
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
    if (h.note && G.state.notes.indexOf(h.note) < 0) G.state.notes.push(h.note);
    // A whenClicked script runs here. The button's own text shows unless the script said
    // something. A danger from a click is ignored.
    var out = h.run ? Toolbox.run(h.run, { r: r }) : {};
    applyMoment({ text: out.said ? null : (D && byName(D.say, names)) || h.text }, r);
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

  G.newGame = function (night) {
    G.state = freshState(night);
    G.checkpoint = null;
    return after(emptyResult(), true);
  };
  G.startOver = G.newGame;
  G.tryAgain = function () {
    if (!G.checkpoint) return G.newGame(G.state.night);
    var r = emptyResult();
    G.state = copy(G.checkpoint.state);
    fire(eventById(G.checkpoint.eventId), r);
    return after(r, true);
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
  G.freshState = freshState;
  G.exits = function () { return (ROOM_INFO[G.state.room].exits || []).slice(); };
  G.clock = function () { return formatTime(G.state.time); };
  G.setShown = function (name, on) { G.state.shown[name] = !!on; };
  G.setDark = function (on) { G.state.dark = !!on; };
  G.isShown = isShown;
  G.isVisible = isVisible;
  G.partVisible = partVisible;
  G.go = go;
  G.click = click;
  G.wait = wait;
  G.scene = scene;
  G.label = label;
  G.roomHas = roomHas;
  G.findHotspot = findHotspot;
  G.beamTouched = beamTouched;
  G.editJump = editJump;
  G.parseTime = parseTime;
  G.formatTime = formatTime;
  return G;
})();
