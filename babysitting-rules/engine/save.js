// save.js: remembers the game between visits. After every action the game is saved in the
// browser, so Continue on the title screen picks up where you left off, and every ending you
// find is remembered. It adds these to Game (engine.js). You don't need to change this file.

(function (G) {
  var SAVE_KEY = "babysitting-rules:save";
  var ENDINGS_KEY = "babysitting-rules:endings";
  var storageOn = true;
  var foundInMemory = [];
  // Endings found before they had readable names still count.
  var LEGACY_ENDINGS = {
    E1: "it-wasnt-her", E2: "mirror", E3: "open-door", E4: "not-the-cat", E5: "spin-cycle",
    E6: "sounds-like-us", E7: "nobody-there", E8: "lost-keys", E9: "forgot-her", W1: "home",
  };

  // ---- every call is wrapped: the game must work without storage ----

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

  function isRule(id) {
    return EVENTS.some(function (ev) { return ev.id === id; });
  }

  // A save from before she edited rules.js or index.html may name things that no longer exist.
  function validState(s) {
    if (!s || typeof s.time !== "number" || !ROOM_INFO[s.room] || !s.shown || !s.fired) return false;
    if (s.camera && !ROOM_INFO[s.camera]) return false;
    for (var id in s.fired) if (!isRule(id)) return false;
    if (s.danger && !(isRule(s.danger.id) && validDanger(s.danger.def))) return false;
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
    if (data.checkpoint && !(validState(data.checkpoint.state) && isRule(data.checkpoint.eventId))) return null;
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

  // ---- what the engine calls ----

  // After every action.
  G.saveNow = function () { writeStore(SAVE_KEY, { state: G.state, checkpoint: G.checkpoint }); };

  // When the game ends.
  G.rememberEnding = function (endingId) {
    var found = endingsFound();
    if (found.indexOf(endingId) < 0) found.push(endingId);
    foundInMemory = found;
    writeStore(ENDINGS_KEY, found);
  };

  // ---- what the view (and the tests) can call ----

  G.continueGame = function () {
    var data = loadSave();
    if (data) {
      G.state = data.state;
      G.checkpoint = data.checkpoint;
    }
    return !!data;
  };
  G.hasSave = function () { return !!loadSave(); };
  G.endingsFound = endingsFound;
  G.useStorage = function (on) { storageOn = on; };
})(Game);
