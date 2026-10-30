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

  // A rule's id is its time, with " #2", " #3"… for later rules at the same time. A rule with
  // between(…) goes by its first time, and keeps the last one in latest. It keeps every
  // trigger it was given (check.js says so when there's more than one).
  T.addRule = function (time, conditions, fn, line) {
    var span = time && time.between ? time : null;
    if (span) time = span.from;
    var same = rules.filter(function (r) { return r.time === time; }).length;
    var rule = {
      id: same ? time + " #" + (same + 1) : time, time: time, between: !!span, latest: span ? span.to : undefined,
      trigger: "now", group: undefined, room: undefined,
      fallback: undefined, notIn: [], after: undefined, armShow: [], run: fn, line: line, triggers: [],
    };
    conditions.forEach(function (c) {
      if (!c || typeof c !== "object") return;
      if (c.trigger) rule.triggers.push(c.trigger);
      for (var key in c) rule[key] = key === "notIn" || key === "armShow" ? rule[key].concat(c[key]) : c[key];
    });
    rules.push(rule);
    return rule;
  };

  // A second whenClicked for the same name takes the first one's place; lines keeps every line it
  // was written on, so check.js can say so.
  T.addClick = function (name, fn, line) {
    var before = Object.prototype.hasOwnProperty.call(clicks, name) ? clicks[name].lines : [];
    clicks[name] = { run: fn, line: line, lines: before.concat([line]) };
  };

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

  // ---- tonight: the times and skips a new game rolls ----

  function has(obj, key) { return !!obj && Object.prototype.hasOwnProperty.call(obj, key); }

  // { rule id: minutes, or null for a rule that doesn't happen tonight }. A rule with between(…)
  // gets a time on its 5-minute steps; one with onSomeNights(n, of) is skipped on the other nights.
  // A saved night keeps what it has, and only the rules it doesn't have yet are rolled.
  T.rollNight = function (events, random, keep) {
    var pick = random || Math.random;
    var night = copy(keep) || {};
    events.forEach(function (ev) {
      if (has(night, ev.id)) return;
      var from = Game.parseTime(ev.time);
      var steps = ev.latest === undefined ? 0 : Math.max(0, Math.floor((Game.parseTime(ev.latest) - from) / 5));
      var skip = ev.odds && pick() * ev.odds[1] >= ev.odds[0];
      var step = steps && !skip ? Math.min(steps, Math.floor(pick() * (steps + 1))) : 0;
      night[ev.id] = skip ? null : from + 5 * step;
    });
    return night;
  };

  // Tonight's minutes for a rule (null: not tonight). A rule the night doesn't have keeps its first time.
  T.tonight = function (ev, state) {
    return state && has(state.night, ev.id) ? state.night[ev.id] : Game.parseTime(ev.time);
  };

  // The rules in tonight's order; rules at the same time keep their order, skipped ones go last.
  T.inTonightsOrder = function (events, state) {
    function key(ev) { var t = T.tonight(ev, state); return t === null || isNaN(t) ? Infinity : t; }
    return events.map(function (ev, i) { return { ev: ev, i: i, t: key(ev) }; })
      .sort(function (a, b) { return a.t - b.t || a.i - b.i; })
      .map(function (x) { return x.ev; });
  };

  // What edit mode's Tonight list calls a rule: the start of what it says, else the first name it
  // shows. It's read from the script, which doesn't run.
  T.labelOf = function (rule) {
    var calls = typeof rule.run === "function" ? T.calls(rule.run) : [];
    function first(name) {
      for (var i = 0; i < calls.length; i++) if (calls[i].name === name && !calls[i].method && calls[i].words.length) return calls[i].words[0];
    }
    var said = first("say");
    if (said) {
      var words = said.replace(/<[^>]*>/g, " ").trim().split(/\s+/);
      return words.slice(0, 7).join(" ") + (words.length > 7 ? "…" : "");
    }
    return first("show") || "the rule at " + rule.time;
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

  // What a rule would do, without doing it: its danger, its ending, and the mistakes its script
  // made. Its script runs silently on a copy of the game (a new one before the first game), then
  // the game is put back as it was. check.js looks at the dangers this way.
  T.pretend = function (rule) {
    var keep = Game.state;
    Game.state = keep ? copy(keep) : Game.freshState();
    try {
      var r = { texts: [], sounds: [], shake: false, problems: [] };
      var out = T.run(rule.run, { r: r, silent: true });
      return { danger: out.danger, ending: out.ending, problems: r.problems };
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

  // ---- reading a script without running it (check.js uses this) ----

  // Every block there is, by name (they're all below).
  T.blocks = ["startAt", "walkingTakes", "lookingTakes", "waitingTakes", "when", "whenClicked",
    "between", "inRoom", "enteringRoomWith", "lightFinds", "notIn", "afterRule", "onSomeNights",
    "say", "playSound", "shake", "show", "hide", "lightsOut", "lightsOn", "endGame", "danger",
    "isShown", "youAreIn", "clockIsBefore", "isDark", "foundWithLight",
    "beIn", "leaveRoom", "click", "anythingIn"];

  var SPACE = /^(\s+|\/\/.*|\/\*[\s\S]*?\*\/)/;
  var STRING = /^("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\[\s\S])*`)/;
  var WORD = /^[A-Za-z_$][\w$]*/;

  // Every call written in a script, read from its source: [{ name, line, method, declared, words }].
  // line: the script's first line is 1. method: a call like list.push(…). declared: not a call but
  // function name(…), her own block. words: the plain strings written right inside its brackets
  // (in a list too, but not inside another call). A string joined with + or holding ${…} is only
  // part of a word, so it isn't one. Strings and comments are skipped.
  T.calls = function (fn) {
    var src = String(fn);
    var calls = [];
    var open = [];               // for each "(" still open: its call, or null
    var line = 1;
    var last = "", before = "";  // the last two things read: a word, '"' for a string, or one character
    for (var i = 0; i < src.length; ) {
      var rest = src.slice(i);
      var space = SPACE.exec(rest), string = !space && STRING.exec(rest);
      var t = (space || string || WORD.exec(rest) || [rest.charAt(0)])[0];
      line += t.split("\n").length - 1;
      i += t.length;
      if (space) continue;
      if (string) {
        var inside = open[open.length - 1];
        var part = last === "+" || /^\s*\+/.test(src.slice(i)) || t.indexOf("${") >= 0;
        if (inside && !part) inside.words.push(t.slice(1, -1));
        t = '"';
      } else if (t === "(") {
        var call = WORD.test(last) ? { name: last, line: line, method: before === ".", declared: before === "function", words: [] } : null;
        if (call) calls.push(call);
        open.push(call);
      } else if (t === ")") {
        open.pop();
      }
      before = last;
      last = t;
    }
    return calls;
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

// when(between("21:00", "22:00"), …): a random time in there, a new one every night.
function between(from, to) { return { between: true, from: from, to: to }; }

// ---- conditions for when() ----

function onSomeNights(n, of) { return { odds: [n, of] }; }
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
