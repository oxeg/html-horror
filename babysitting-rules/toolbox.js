// toolbox.js: the blocks that rules.js is made of (when, say, show, danger…).
// rules.js hands its scripts to these blocks when it loads. When a script runs, the
// blocks it uses are written down here, and the engine turns them into what you see
// and hear. You don't need to change this file.

var Toolbox = (function () {
  var T = {};
  var DEFAULTS = { startTime: "19:00", startRoom: "entrance", moveMinutes: 10, lookMinutes: 10, waitMinutes: 15 };
  var setup, rules, clicks;
  var running = null; // the script running right now: { r, silent, byFallback, out }

  function copy(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  function list(value) { return value === undefined ? [] : [].concat(value); }

  // The line in rules.js a stack points at: the first place outside the engine's own files.
  T.lineOf = function (stack) {
    var lines = String(stack || "").split("\n");
    for (var i = 0; i < lines.length; i++) {
      var m = /([^\s()]+):(\d+):\d+\)?\s*$/.exec(lines[i]);
      if (m && !/(^|\/)(toolbox|engine)\.js$/.test(m[1])) return Number(m[2]);
    }
    return 0;
  };

  T.reset = function () {
    setup = copy(DEFAULTS);
    rules = [];
    clicks = {};
  };

  T.set = function (key, value) { setup[key] = value; };
  T.settings = function () { return copy(setup); };

  // A rule's id is its time, with " #2", " #3"… for later rules at the same time.
  T.addRule = function (time, conditions, fn, line) {
    var same = rules.filter(function (r) { return r.time === time; }).length;
    var rule = {
      id: same ? time + " #" + (same + 1) : time, time: time, trigger: "now", group: undefined, room: undefined,
      fallback: undefined, notIn: [], after: undefined, armShow: [], run: fn, line: line,
    };
    conditions.forEach(function (c) {
      if (!c || typeof c !== "object") return;
      for (var key in c) rule[key] = key === "notIn" || key === "armShow" ? rule[key].concat(c[key]) : c[key];
    });
    rules.push(rule);
    return rule;
  };

  T.addClick = function (name, fn, line) { clicks[name] = { run: fn, line: line }; };

  // Sorted by time; rules at the same time keep their order in rules.js.
  T.rules = function () {
    function minutes(time) {
      var t = Game.parseTime(time);
      return isNaN(t) ? Infinity : t;
    }
    return rules.map(function (rule, i) { return { rule: rule, i: i, t: minutes(rule.time) }; })
      .sort(function (a, b) { return a.t - b.t || a.i - b.i; })
      .map(function (x) { return x.rule; });
  };

  T.clickScripts = function () {
    var out = {};
    for (var name in clicks) out[name] = clicks[name];
    return out;
  };

  function scriptLine(fn) {
    var all = rules.concat(Object.keys(clicks).map(function (name) { return clicks[name]; }));
    for (var i = 0; i < all.length; i++) if (all[i].run === fn) return all[i].line;
    return 0;
  }

  // Runs one script. Its words, sounds and shake go into ctx.r (not in silent mode); show,
  // hide and the lights change the game at once; its ending and danger come back to the
  // engine. A mistake inside the script becomes a problem, and the game goes on.
  T.run = function (fn, ctx) {
    var r = ctx.r || { texts: [], sounds: [], shake: false };
    var out = { ending: null, danger: null, said: false };
    var outer = running;
    running = { r: r, silent: !!ctx.silent, byFallback: !!ctx.byFallback, out: out };
    try {
      fn();
    } catch (e) {
      if (!r.problems) r.problems = [];
      r.problems.push({ file: "rules.js", line: T.lineOf(e && e.stack) || scriptLine(fn), message: (e && e.message) || String(e) });
    } finally {
      running = outer;
    }
    return out;
  };

  // What a rule would do, without doing it: its danger and its ending. Its script runs silently
  // on a copy of the game (a new one before the first game), then the game is put back as it was.
  // check.js looks at the dangers this way.
  T.pretend = function (rule) {
    var keep = Game.state;
    Game.state = keep ? copy(keep) : Game.freshState();
    try {
      var out = T.run(rule.run, { r: { texts: [], sounds: [], shake: false, problems: [] }, silent: true });
      return { danger: out.danger, ending: out.ending };
    } finally {
      Game.state = keep;
    }
  };

  // The script that is running, for a block that only works inside one.
  T.script = function (block) {
    if (!running) throw new Error(block + "() only works inside a when() or whenClicked() script.");
    return running;
  };

  // ---- danger(): her words → the engine's ----

  function hasFunction(value) {
    if (typeof value === "function") return true;
    if (!value || typeof value !== "object") return false;
    for (var key in value) if (hasFunction(value[key])) return true;
    return false;
  }

  // A moment is a string, or { say, sound, shake, show, hide }.
  function moment(m) {
    if (m === undefined || m === null) return undefined;
    if (typeof m === "string") return { text: m };
    return {
      text: m.say, sound: m.sound, shake: m.shake,
      show: m.show === undefined ? undefined : list(m.show),
      hide: m.hide === undefined ? undefined : list(m.hide),
    };
  }

  // One piece of safe or deadly. A deadly piece ends the game with its own ending, or the danger's.
  function piece(p, spec, deadly) {
    if (!p || !p.piece) return p; // already in the engine's words
    var ending = deadly ? (p.extra && p.extra.ending) || spec.ending : undefined;
    if (p.piece === "click") return deadly ? { hotspot: p.hotspot, ending: ending } : { hotspot: p.hotspot, then: moment(p.extra) };
    if (p.piece === "leave") return { leave: p.leave };
    return { room: p.room, ending: ending };
  }

  T.translate = function (spec) {
    if (hasFunction(spec)) throw new Error("danger() can't hold a function");
    var s = spec || {};
    var wait = s.thenWait;
    function pieces(value, deadly) {
      return value === undefined ? undefined : list(value).map(function (p) { return piece(p, s, deadly); });
    }
    return copy({
      deadline: s.clicks,
      steps: pieces(s.safe, false),
      late: s.ending,
      fatal: pieces(s.deadly, true),
      endure: s.lasts,
      waitEnds: s.waitEndsIt,
      say: s.buttonSays,
      labels: s.labels,
      hold: wait && {
        button: wait.button || "Wait",
        steps: list(wait.steps).map(moment),
        labels: wait.labels,
        keep: wait.otherClicks,
        fatal: wait.ending || s.ending,
      },
      whenSafe: moment(s.whenSafe),
    });
  };

  T.reset();
  return T;
})();

// ---- setup ----

function startAt(time, room) {
  Toolbox.set("startTime", time);
  if (room !== undefined) Toolbox.set("startRoom", room);
}
function walkingTakes(min) { Toolbox.set("moveMinutes", min); }
function lookingTakes(min) { Toolbox.set("lookMinutes", min); }
function waitingTakes(min) { Toolbox.set("waitMinutes", min); }

// ---- scripts ("hat blocks") ----

function whenClicked(name, fn) { Toolbox.addClick(name, fn, Toolbox.lineOf(new Error().stack)); }

// when(time, ...conditions, fn)
function when(time) {
  var conditions = [].slice.call(arguments, 1);
  var fn = conditions.pop();
  return Toolbox.addRule(time, conditions, fn, Toolbox.lineOf(new Error().stack));
}

// ---- conditions for when() ----

function inRoom(room) { return { trigger: "inRoom", room: room }; }
function enteringRoomWith(name) { return { trigger: "nextEntry", group: name }; }
function lightFinds(name, clicks) { return { trigger: "beam", group: name, fallback: clicks, armShow: [name] }; }
function notIn() { return { notIn: [].slice.call(arguments) }; }
function afterRule(time) { return { after: time }; }

// ---- blocks ----

function say(text) {
  var s = Toolbox.script("say");
  s.out.said = true;
  if (!s.silent) s.r.texts.push(text);
}
function playSound(name) {
  var s = Toolbox.script("playSound");
  if (!s.silent) s.r.sounds.push(name);
}
function shake() {
  var s = Toolbox.script("shake");
  if (!s.silent) s.r.shake = true;
}
function show() {
  Toolbox.script("show");
  [].concat.apply([], arguments).forEach(function (name) { Game.setShown(name, true); });
}
function hide() {
  Toolbox.script("hide");
  [].concat.apply([], arguments).forEach(function (name) { Game.setShown(name, false); });
}
function lightsOut() { Toolbox.script("lightsOut"); Game.setDark(true); }
function lightsOn() { Toolbox.script("lightsOn"); Game.setDark(false); }
function endGame(id) { Toolbox.script("endGame").out.ending = id; }
function danger(spec) { Toolbox.script("danger").out.danger = Toolbox.translate(spec); }

// ---- checks, for if ----

function isShown(name) { Toolbox.script("isShown"); return Game.isShown(name); }
function youAreIn(room) { Toolbox.script("youAreIn"); return Game.state.room === room; }
function clockIsBefore(time) { Toolbox.script("clockIsBefore"); return Game.state.time < Game.parseTime(time); }
function isDark() { Toolbox.script("isDark"); return !!Game.state.dark; }
function foundWithLight() { return !Toolbox.script("foundWithLight").byFallback; }

// ---- the pieces of a danger ----

function beIn(room) { return { piece: "beIn", room: room }; }
function leaveRoom(room) { return { piece: "leave", leave: room }; }
function click(name, extra) { return { piece: "click", hotspot: name, extra: extra }; }
function anythingIn(room) { return { piece: "anything", room: room }; }
