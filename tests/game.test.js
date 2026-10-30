// The real game: validation, texts, and every scripted playthrough.
function playStep(step) {
  var p = step.split(" ");
  if (p[0] === "go") return Game.go(p[1]);
  if (p[0] === "click") return Game.click(p[1]);
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

// Node only: in a browser this would touch the real saved endings.
if (typeof document === "undefined") {
  test("endings found before they had names (E1…W1) still count", function () {
    var data = { "babysitting-rules:endings": JSON.stringify(["E1", "W1", "home", "E8", "GONE"]) };
    globalThis.localStorage = {
      getItem: function (k) { return k in data ? data[k] : null; },
      setItem: function (k, v) { data[k] = String(v); },
    };
    Game.useStorage(true);
    try {
      eq(Game.endingsFound(), ["it-wasnt-her", "home", "lost-keys"]);
    } finally {
      Game.useStorage(false);
      delete globalThis.localStorage;
    }
  });
}

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
  eq(Game.state.danger && Game.state.danger.id, "rule1", "rule 1 starts in the hallway");
  eq(Game.state.shown["door-open"], undefined, "the bedroom door is still closed");
  ["go master-door", "click door-closed", "click walk-in-door", "wait", "wait", "wait"].forEach(playStep);
  eq(Game.state.ending, null, "made it to the walk-in");
  ["go master", "go master-door", "wait", "wait"].forEach(playStep);
  eq(Game.state.ending, null);
  eq(Game.state.shown["door-open"], true, "afterwards the door is found open");
});
