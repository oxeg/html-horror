// The real game: validation, texts, and every scripted playthrough.
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
  Game.newGame();
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
    Game.newGame();
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
      Game.newGame();
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
      Game.newGame();
      COUNTING.concat(["wait", "wait", "wait", "wait", "wait"]).forEach(playStep);
      Game.useStorage(false);
      Game.newGame(); // a fresh game that isn't saved: the save is still the count
      Game.useStorage(true);
      ok(Game.continueGame(), "Continue is offered");
      eq([Game.state.danger.id, Game.state.danger.held], ["22:20", 5]);
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
  Game.newGame();
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
    Game.newGame();
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

test("rule 1 is still survivable when it first happens after 21:50", function () {
  Game.useStorage(false);
  Game.newGame();
  ["jump 21:05 bath", "wait", "wait", "wait", "go entrance"].forEach(playStep);
  eq(Game.state.danger && Game.state.danger.id, "21:20", "rule 1 starts in the hallway");
  eq(Game.isShown("door-open"), false, "the bedroom door is still closed");
  ["go master-door", "click door-closed", "click walk-in-door", "wait", "wait", "wait"].forEach(playStep);
  eq(Game.state.ending, null, "made it to the walk-in");
  ["go master", "go master-door", "wait", "wait"].forEach(playStep);
  eq(Game.state.ending, null);
  eq(Game.isShown("door-open"), true, "afterwards the door is found open");
});
