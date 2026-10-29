// engine.js: the game machine. It keeps track of the clock, the room, the flags,
// the events and the dangers. It never draws anything (view.js does that), so the
// tests can play the whole game without a browser. You don't need to change this
// file: everything you'd want to change lives in story.js.

var Game = (function () {
  var SAVE_KEY = "babysitting-rules:save";
  var ENDINGS_KEY = "babysitting-rules:endings";
  var storageOn = true;
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

  function emptyResult() {
    return { texts: [], sounds: [], shake: false, ending: null };
  }

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function setFlags(list, on) {
    (list || []).forEach(function (name) {
      if (on) G.state.flags[name] = true;
      else delete G.state.flags[name];
    });
  }

  function overlayRoom() {
    for (var id in ROOM_INFO) if (ROOM_INFO[id].overlay) return id;
    return null;
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

  // ---- events ----

  function due(ev) {
    return !G.state.fired[ev.id] && G.state.time >= parseTime(ev.time);
  }

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
  }

  // Runs after every action: fires whatever is due, in story order.
  function processEvents(r, entered) {
    for (var i = 0; i < EVENTS.length; i++) {
      var ev = EVENTS[i];
      if (G.state.ending) return;
      if (!due(ev)) continue;
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

  function after(r, entered) {
    if (!entered) G.state.actionsHere++;
    processEvents(r, entered);
    return r;
  }

  function beamTouched(name) {
    var r = emptyResult();
    if (G.state.ending) return r;
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
  }

  // ---- moving, looking, ending ----

  function enter(roomId) {
    G.state.room = roomId;
    G.state.camera = false;
    G.state.actionsHere = 0;
  }

  function endGame(endingId, r) {
    G.state.ending = endingId;
    r.ending = endingId;
  }

  function spend(minutes) {
    G.state.time += minutes;
  }

  function go(roomId) {
    var r = emptyResult();
    if (G.state.ending) return r;
    if ((ROOM_INFO[G.state.room].exits || []).indexOf(roomId) < 0) return r;
    enter(roomId);
    spend(SETTINGS.moveMinutes);
    return after(r, true);
  }

  function click(id) {
    var r = emptyResult();
    var h = hotspot(id);
    if (G.state.ending || !h) return r;
    if (h.ending) {
      endGame(h.ending, r);
      return r;
    }
    var minutes = h.minutes != null ? h.minutes : h.note ? 0 : h.goTo ? SETTINGS.moveMinutes : SETTINGS.lookMinutes;
    if (h.notBefore && G.state.time < parseTime(h.notBefore)) {
      r.texts.push(h.tooEarly);
      spend(minutes);
      return after(r, false);
    }
    if (h.text) r.texts.push(h.text);
    if (h.note && G.state.notes.indexOf(h.note) < 0) G.state.notes.push(h.note);
    setFlags(h.setFlags, true);
    if (h.action === "camera") G.state.camera = true;
    if (h.goTo) enter(h.goTo);
    spend(minutes);
    return after(r, !!h.goTo);
  }

  function wait() {
    var r = emptyResult();
    if (G.state.ending) return r;
    spend(SETTINGS.waitMinutes);
    return after(r, false);
  }

  // ---- what the view asks ----

  function label(id) {
    var h = hotspot(id);
    return h ? h.label : "";
  }

  G.newGame = function () {
    G.state = freshState();
    G.checkpoint = null;
    return after(emptyResult(), true);
  };
  G.go = go;
  G.click = click;
  G.wait = wait;
  G.closeCamera = function () {
    G.state.camera = false;
  };
  G.exits = function () {
    return (ROOM_INFO[G.state.room].exits || []).slice();
  };
  G.scene = scene;
  G.label = label;
  G.clock = function () {
    return formatTime(G.state.time);
  };
  G.roomHas = roomHas;
  G.beamTouched = beamTouched;
  G.editJump = editJump;
  G.setFlag = function (name, on) {
    setFlags([name], on);
  };
  G.parseTime = parseTime;
  G.formatTime = formatTime;
  G.useStorage = function (on) {
    storageOn = on;
  };
  return G;
})();
