// The real game: validation, texts, and every scripted playthrough.

// The classic night: every scare at the time it had before random nights, nothing skipped and no
// little extras. The playthroughs and the tests below are written for it.
var CLASSIC = { "21:10": "21:20", "21:20": "21:40", "21:30": "21:50", "21:35": "22:00", "21:40": "22:20", "22:00": "22:40" };
function classicNight() {
  var night = {};
  EVENTS.forEach(function (ev) {
    night[ev.id] = CLASSIC[ev.id] ? Game.parseTime(CLASSIC[ev.id]) : ev.odds ? null : Game.parseTime(ev.time);
  });
  return night;
}

function playStep(step) {
  var p = step.split(" ");
  if (p[0] === "go") return Game.go(p[1]);
  if (p[0] === "click") {
    // A player can only click what they can see.
    var room = Game.scene();
    var id = Game.findHotspot(room, p[1]);
    if (!id) throw new Error("no button here: " + p[1] + " (in " + room + ")");
    var h = ROOM_INFO[room].hotspots[id];
    if (!Game.isVisible(h.names || [id], h.hidden)) throw new Error("hidden: " + p[1]);
    return Game.click(p[1]);
  }
  if (p[0] === "wait") return Game.wait();
  if (p[0] === "beam") return Game.beamTouched(p[1]);
  if (p[0] === "close") return Game.closeCamera();
  if (p[0] === "jump") return Game.editJump(p[2], p[1]);
  if (p[0] === "show") return Game.setShown(p[1], p[2] === "on");
  throw new Error("unknown step: " + step);
}

function describeState() {
  var s = Game.state;
  return Game.clock() + " in " + s.room + (s.danger ? " (danger " + s.danger.id + ")" : "") + (s.ending ? " ended " + s.ending : "");
}

test("real game passes validation", function () {
  var res = Check.run();
  eq(res.errors, []);
  eq(res.warnings, []);
});

// In Node, run-node.js reads every drawing from engine/drawings/ (but not plain.js); in a page,
// loader.js adds them itself, plain.js too.
test("every room has a drawing or the plain one", function () {
  Object.keys(ROOM_INFO).forEach(function (id) {
    ok(typeof ROOMS[id] === "string" || typeof ROOMS.plain === "string", "room " + id + " has no drawing");
  });
  ok(typeof ROOMS.title === "string", "the title screen has its drawing");
  if (typeof document !== "undefined") {
    ok(typeof ROOMS.plain === "string", "engine/drawings/plain.js loaded itself");
    ok(/<svg[\s>]/.test(ROOMS.plain) && ROOMS.plain.indexOf("data-name") < 0, "the plain room is an empty shell: nothing in it has a name");
  }
});

test("the game says your sister and the cat, never a name", function () {
  var all = JSON.stringify([ROOM_INFO, NOTES, ENDINGS, EVENTS]); // scripts drop out: only the texts are left
  ok(all.indexOf("${") < 0, "a ${...} was left unfilled");
  ok(all.indexOf("SISTER_NAME") < 0 && all.indexOf("CAT_NAME") < 0, "placeholder name in text");
  ok(typeof SISTER_NAME === "undefined" && typeof CAT_NAME === "undefined", "the name settings are gone");
  ok(/your sister/i.test(all) && /the cat/i.test(all), "the texts say your sister and the cat");
});

test("the fake note gives itself away: no Love you", function () {
  ok(!NOTES.rules.fake && NOTES.rules.html.indexOf("Love you!") >= 0, "the real note is signed Love you");
  ok(NOTES["door-note"].fake && NOTES["door-note"].html.indexOf("Love you") < 0, "the fake note must not say Love you");
  ok(ENDINGS["lost-keys"].text.indexOf("Love you") >= 0, "the lost-keys ending explains the giveaway");
});

test("clicking your sister runs her whenClicked script from rules.js", function () {
  Game.useStorage(false);
  Game.newGame(classicNight());
  playStep("go sister-room");
  eq(Game.click("sister-awake").texts, ["You play a board game with your sister. She wins. Twice."], "before 8");
  ok(Game.isShown("sister-awake"), "still awake");
  playStep("jump 20:00 sister-room");
  eq(Game.click("sister-awake").texts, ['You tuck your sister in. "Night night." She\'s asleep in seconds.'], "at 8");
  eq([Game.isShown("sister-awake"), Game.isShown("blanket"), Game.isShown("sister-asleep")], [false, false, true], "tucked in");
});

test("tucking your sister in says the words inside her button in index.html (HTML 1)", function () {
  var h = ROOM_INFO["sister-room"].hotspots["sister-awake"];
  var text = h.text;
  h.text = "Sweet dreams, little one.";  // as if she changed it in index.html
  try {
    Game.useStorage(false);
    Game.newGame(classicNight());
    playStep("jump 20:00 sister-room");
    eq(Game.click("sister-awake").texts, ["Sweet dreams, little one."]);
  } finally {
    h.text = text;
  }
});

// Plays with a pretend localStorage while fn runs, and gives fn its data.
function withStorage(data, fn) {
  globalThis.localStorage = {
    getItem: function (k) { return k in data ? data[k] : null; },
    setItem: function (k, v) { data[k] = String(v); },
  };
  Game.useStorage(true);
  try {
    fn(data);
  } finally {
    Game.useStorage(false);
    delete globalThis.localStorage;
  }
}

// Rule 3 up to the count, standing in the bathroom with the door locked.
var COUNTING = ["jump 22:15 my-room", "wait", "beam face", "go entrance", "go bath", "click bath-lock"];

// Node only: in a browser these would touch the real save and the real saved endings.
if (typeof document === "undefined") {
  test("endings found before they had names (E1…W1) still count", function () {
    withStorage({ "babysitting-rules:endings": JSON.stringify(["E1", "W1", "home", "E8", "GONE"]) }, function () {
      eq(Game.endingsFound(), ["it-wasnt-her", "home", "lost-keys"]);
    });
  });

  test("a save from before rules.js (old ids in the danger or in fired) is refused", function () {
    withStorage({}, function (data) {
      Game.newGame(classicNight());
      COUNTING.concat(["wait"]).forEach(playStep);
      var good = data["babysitting-rules:save"];
      ok(Game.hasSave(), "the save of rule 3's count is fine");
      function refused(what, change) {
        var save = JSON.parse(good);
        change(save.state);
        data["babysitting-rules:save"] = JSON.stringify(save);
        eq(Game.hasSave(), false, what);
      }
      refused("late E6", function (s) { s.danger.def.late = "E6"; });
      refused("deadly E5", function (s) { s.danger.def.fatal[0].ending = "E5"; });
      refused("the count's E6", function (s) { s.danger.def.hold.fatal = "E6"; });
      refused("fired rule1", function (s) { s.fired.rule1 = true; });
    });
  });

  test("Continue in the middle of the count goes on where it was", function () {
    withStorage({}, function () {
      Game.newGame(classicNight());
      COUNTING.concat(["wait", "wait", "wait", "wait", "wait"]).forEach(playStep);
      Game.useStorage(false);
      Game.newGame(classicNight()); // a fresh game that isn't saved: the save is still the count
      Game.useStorage(true);
      ok(Game.continueGame(), "Continue is offered");
      eq([Game.state.danger.id, Game.state.danger.held], ["21:40", 5]);
      eq(Game.waitLabel(), "Count");
      eq(Game.label("bath-lock"), "Open the door");
      var r;
      for (var i = 0; i < 5; i++) r = Game.wait();
      eq(Game.state.danger, null, "the count is over");
      eq(r.texts[r.texts.length - 1], "Silence. The knocking has stopped.");
    });
  });
}

function play(steps) {
  Game.useStorage(false);
  Game.newGame(classicNight());
  steps.forEach(playStep);
}

// Rule 1 up to the wait, hiding in the walk-in closet.
var HIDING = ["jump 21:15 my-room", "wait", "go entrance", "go master-door", "click door-closed", "click walk-in-door"];
// Rule 4b up to the wait, in the bathroom with your sister.
var WITH_HER = ["jump 23:05 entrance", "wait", "go sister-room", "click sister-asleep", "go entrance", "go bath", "click bath-lock"];

test("harmless clicks while waiting keep you waiting", function () {
  play(HIDING);
  eq(Game.click("clothes").texts, ["Stay still. Wait until it stops."], "rule 1");
  eq([Game.state.ending, Game.state.danger.holding], [null, true], "rule 1 still waiting");
  play(COUNTING);
  eq(Game.click("bath-sink").texts, ["Keep counting..."], "rule 3");
  eq([Game.state.ending, Game.state.danger.holding], [null, true], "rule 3 still counting");
  play(WITH_HER);
  eq(Game.click("basket").texts, ["Stay quiet. Wait."], "rule 4b");
  eq([Game.state.ending, Game.state.danger.holding], [null, true], "rule 4b still waiting");
});

test("leaving while waiting gives you away", function () {
  play(HIDING);
  eq(Game.go("master").ending, "it-wasnt-her", "rule 1");
  play(COUNTING);
  eq(Game.go("entrance").ending, "sounds-like-us", "rule 3");
});

test("playthroughs never click a hidden button", function () {
  var message = null;
  try {
    play(["jump 19:05 entrance", "click hall-not-sister"]);
  } catch (e) {
    message = e.message;
  }
  eq(message, "hidden: hall-not-sister");
});

test("the deadline check finds a click with no room in every room with that button", function () {
  eq(Check.shortest("bath-washer", [{ hotspot: "lock" }]), 1, "the laundry bathroom's lock is a lock too");
  eq(Check.shortest("entrance", [{ hotspot: "lock" }]), 2);
  eq(Check.shortest("bath-washer", [{ hotspot: "bath-lock" }]), 3, "only the bathroom has bath-lock");
  eq(Check.shortest("master", [{ hotspot: "sister-asleep" }, { hotspot: "lock" }]), 7, "rule 4b from the parents' bedroom");
});

PLAYTHROUGHS.forEach(function (pt) {
  test("playthrough " + pt.name, function () {
    Game.useStorage(false);
    Game.newGame(classicNight());
    pt.steps.forEach(function (step, i) {
      if (Game.state.ending) throw new Error("ended " + Game.state.ending + " early, before step " + i + " (" + step + ")");
      playStep(step);
    });
    eq(Game.state.ending, pt.ending, "ending (now " + describeState() + ")");
    if (pt.retry) {
      Game.tryAgain();
      eq(Game.state.ending, null, "ending after Try again");
      eq(Game.state.danger ? Game.state.danger.id : null, pt.retry.danger, "danger after Try again");
    }
  });
});

// A random that gives the same numbers every run, so random nights can be tested.
function seeded(seed) {
  return function () {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
}

var SCARES = Object.keys(CLASSIC);

test("200 random nights: every time is in its window, and the end of the night stays put", function () {
  var random = seeded(7);
  var orders = {}, skipping = 0;
  for (var i = 0; i < 200; i++) {
    var night = Toolbox.rollNight(EVENTS, random);
    eq([night["23:00"], night["23:10"], night["23:30"]], [Game.parseTime("23:00"), Game.parseTime("23:10"), Game.parseTime("23:30")]);
    EVENTS.forEach(function (ev) {
      var t = night[ev.id];
      if (t === null) return ok(ev.odds, ev.id + " is skipped, but it has no onSomeNights");
      ok(t >= Game.parseTime(ev.time) && t <= Game.parseTime(ev.latest || ev.time) && (t - Game.parseTime(ev.time)) % 5 === 0, ev.id + " at " + Game.formatTime(t));
    });
    ok(night["22:00"] === null || night["22:00"] < Game.parseTime("23:00"), "the first doorbell rings before Mom's");
    var here = SCARES.filter(function (id) { return night[id] !== null; });
    if (here.length < SCARES.length) skipping++;
    orders[here.sort(function (a, b) { return night[a] - night[b]; }).join(" ")] = true;
  }
  ok(Object.keys(orders).length > 50, Object.keys(orders).length + " different orders");
  ok(skipping > 60 && skipping < 130, skipping + " nights of 200 skip a scare");
});

test("100 random nights played with random clicks never break, and every one ends", function () {
  var random = seeded(11);
  function any(list) { return list[Math.floor(random() * list.length)]; }
  for (var n = 0; n < 100; n++) {
    Game.useStorage(false);
    Game.newGame(Toolbox.rollNight(EVENTS, random));
    for (var step = 0; step < 400 && !Game.state.ending; step++) {
      var room = Game.scene();
      var visible = Object.keys(ROOM_INFO[room].hotspots).filter(function (id) {
        var h = ROOM_INFO[room].hotspots[id];
        return Game.isVisible(h.names || [id], h.hidden);
      });
      var pick = random();
      var r = pick < 0.3 || !visible.length ? Game.wait()
        : pick < 0.6 && Game.exits().length ? Game.go(any(Game.exits()))
        : pick < 0.65 ? Game.beamTouched("face")
        : Game.click(any(visible));
      if (r && r.problems && r.problems.length) throw new Error("night " + n + ": " + JSON.stringify(r.problems));
    }
    ok(Game.state.ending, "night " + n + " never ended (" + describeState() + ")");
  }
});

// A careful player: does what the note says when a scare starts, and otherwise walks around the
// flat (through every room with a doorway or a window) without touching anything. Gives the ending.
function carefulNight(night) {
  // Where you can go from a room: its links, and the doors you can see (never into the parents'
  // bedroom once its door is open).
  function ways(room) {
    var out = (ROOM_INFO[room].exits || []).map(function (e) { return { to: e, step: "go " + e }; });
    var spots = ROOM_INFO[room].hotspots;
    Object.keys(spots).forEach(function (id) {
      var h = spots[id];
      if (h.goTo && Game.isVisible(h.names || [id], h.hidden)) out.push({ to: h.goTo, step: "click " + id });
    });
    return out.filter(function (w) { return !(w.to === "master" && Game.isShown("door-open")); });
  }
  // The first step of the shortest way to a room.
  function toward(target) {
    var seen = {}, queue = [{ room: Game.state.room, first: null }];
    seen[Game.state.room] = true;
    while (queue.length) {
      var at = queue.shift();
      if (at.room === target) return at.first;
      ways(at.room).forEach(function (w) {
        if (seen[w.to]) return;
        seen[w.to] = true;
        queue.push({ room: w.to, first: at.first || w.step });
      });
    }
    throw new Error("no way to " + target + " from " + Game.state.room);
  }
  function inOr(room, step) { return Game.state.room === room ? step : toward(room); }
  var RULES = {
    "21:10": function () { return toward("walk-in"); },                       // hide in the walk-in
    "21:20": function () { return toward("entrance"); },                      // walk away from the mirror
    "21:35": function () { return "wait"; },                                  // don't let the cat in
    "21:40": function () { return inOr("bath", "click bath-lock"); },         // the bathroom without the washer
    "22:00": function () { return "wait"; },                                  // nobody there: don't answer
    "23:00": function () { return "wait"; },                                  // "Mom": don't open
    "23:10": function () {                                                    // take your sister and hide
      return Game.isShown("sister-asleep") ? inOr("sister-room", "click sister-asleep") : inOr("bath", "click bath-lock");
    },
  };
  var TOUR = ["living", "entrance", "my-room", "entrance", "sister-room", "entrance", "master-door", "entrance"];
  var next = 0;
  Game.useStorage(false);
  Game.newGame(night);
  for (var i = 0; i < 600 && !Game.state.ending; i++) {
    var d = Game.state.danger;
    var step;
    if (d && d.holding) step = "wait";
    else if (d) step = RULES[d.id]();
    else if (Game.state.room === TOUR[next]) {
      next = (next + 1) % TOUR.length;
      step = "beam face";  // look around with the light
    } else step = toward(TOUR[next]);
    playStep(step);
  }
  return Game.state.ending ? Game.state.ending : "no ending (" + describeState() + ")";
}

test("a careful player gets home on 100 random nights", function () {
  eq(carefulNight(classicNight()), "home", "the classic night");
  var random = seeded(23);
  for (var n = 0; n < 100; n++) {
    var night = Toolbox.rollNight(EVENTS, random);
    var tonight = SCARES.map(function (id) { return id + "→" + (night[id] === null ? "skipped" : Game.formatTime(night[id])); }).join(" ");
    eq(carefulNight(night), "home", "night " + n + " (" + tonight + ")");
  }
});

test("an edit-mode jump never opens the bedroom door before your sister's scare", function () {
  var night = classicNight();
  night["21:10"] = Game.parseTime("22:05");  // your sister comes late tonight
  night["21:30"] = Game.parseTime("21:35");  // the door's own time is earlier
  Game.useStorage(false);
  Game.newGame(night);
  playStep("jump 21:50 entrance");
  eq(Game.isShown("door-open"), false, "the door is still closed");
  ["wait", "wait", "go my-room"].forEach(playStep);
  eq(Game.state.danger && Game.state.danger.id, "21:10", "your sister comes");
  ["go entrance", "go master-door", "click door-closed", "click walk-in-door", "wait", "wait", "wait"].forEach(playStep);
  eq(Game.state.ending, null, "made it to the walk-in");
});

test("rule 1 is still survivable when it first happens after 21:50", function () {
  Game.useStorage(false);
  Game.newGame(classicNight());
  ["jump 21:05 bath", "wait", "wait", "wait", "go entrance"].forEach(playStep);
  eq(Game.state.danger && Game.state.danger.id, "21:10", "rule 1 starts in the hallway");
  eq(Game.isShown("door-open"), false, "the bedroom door is still closed");
  ["go master-door", "click door-closed", "click walk-in-door", "wait", "wait", "wait"].forEach(playStep);
  eq(Game.state.ending, null, "made it to the walk-in");
  ["go master", "go master-door", "wait", "wait"].forEach(playStep);
  eq(Game.state.ending, null);
  eq(Game.isShown("door-open"), true, "afterwards the door is found open");
});
