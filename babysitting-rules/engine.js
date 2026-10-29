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
      actionsHere: 0,
      ending: null,
      danger: null,
    };
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
    return r;
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
      return r;
    }
    if (h.text) r.texts.push(h.text);
    if (h.note && G.state.notes.indexOf(h.note) < 0) G.state.notes.push(h.note);
    setFlags(h.setFlags, true);
    if (h.action === "camera") G.state.camera = true;
    if (h.goTo) enter(h.goTo);
    spend(minutes);
    return r;
  }

  function wait() {
    var r = emptyResult();
    if (G.state.ending) return r;
    spend(SETTINGS.waitMinutes);
    return r;
  }

  // ---- what the view asks ----

  function label(id) {
    var h = hotspot(id);
    return h ? h.label : "";
  }

  G.newGame = function () {
    G.state = freshState();
    G.checkpoint = null;
    return emptyResult();
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
  G.parseTime = parseTime;
  G.formatTime = formatTime;
  G.useStorage = function (on) {
    storageOn = on;
  };
  return G;
})();
