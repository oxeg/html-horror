// The real game: validation, texts, and every scripted playthrough.
function playStep(step) {
  var p = step.split(" ");
  if (p[0] === "go") return Game.go(p[1]);
  if (p[0] === "click") return Game.click(p[1]);
  if (p[0] === "wait") return Game.wait();
  if (p[0] === "beam") return Game.beamTouched(p[1]);
  if (p[0] === "close") return Game.closeCamera();
  if (p[0] === "jump") return Game.editJump(p[2], p[1]);
  if (p[0] === "flag") return Game.setFlag(p[1], p[2] === "on");
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

test("no unfilled template text", function () {
  var all = JSON.stringify([NOTES, ROOM_INFO, EVENTS, ENDINGS]);
  ok(all.indexOf("${") < 0, "a ${...} was left unfilled");
  ok(all.indexOf("SISTER_NAME") < 0 && all.indexOf("CAT_NAME") < 0, "placeholder name in text");
  ok(all.indexOf(SISTER_NAME) >= 0 && all.indexOf(CAT_NAME) >= 0, "the name settings are used");
});

test("no real names: the game says your sister and the cat", function () {
  eq(SISTER_NAME, "your sister");
  eq(CAT_NAME, "the cat");
  var all = JSON.stringify([NOTES, ROOM_INFO, EVENTS, ENDINGS]);
  ok(all.indexOf("Mia") < 0 && all.indexOf("Whiskers") < 0, "a real name is still in the story");
});

test("the fake note gives itself away: no Love you", function () {
  ok(NOTES.fridge.text.indexOf("Love you!") >= 0, "the real note is signed Love you");
  ok(NOTES.fake.text.indexOf("Love you") < 0, "the fake note must not say Love you");
  ok(ENDINGS.E8.text.indexOf("Love you") >= 0, "E8 explains the giveaway");
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
  eq(Game.state.danger && Game.state.danger.id, "rule1", "rule 1 starts in the hallway");
  eq(Game.state.flags.masterOpen, undefined, "the bedroom door is still closed");
  ["go master-door", "click door-closed", "click walk-in-door", "wait", "wait", "wait"].forEach(playStep);
  eq(Game.state.ending, null, "made it to the walk-in");
  ["go master", "go master-door", "wait", "wait"].forEach(playStep);
  eq(Game.state.ending, null);
  eq(Game.state.flags.masterOpen, true, "afterwards the door is found open");
});
