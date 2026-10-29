// Events: when they fire, what they do, and the checkpoint taken before each one.
function has(list, item) {
  return list.indexOf(item) >= 0;
}

function waits(n) {
  var r;
  for (var i = 0; i < n; i++) r = Game.wait();
  return r;
}

test("now event fires when an action crosses its time", function () {
  Game.newGame();
  var r = waits(2);
  ok(has(r.texts, "E1 text"), "text");
  ok(has(r.sounds, "click"), "sound");
  eq(Game.state.flags.x, true);
  eq(Game.state.fired.e1, true);
});

test("events crossed together fire in list order", function () {
  Game.newGame();
  eq(waits(2).texts, ["E1 text", "E2 text"]);
});

test("unlessFlag fires silently", function () {
  Game.newGame();
  Game.setFlag("asleep", true);
  waits(2);
  var r = Game.wait();
  ok(!has(r.texts, "Bed"), "no Bed text");
  eq(Game.state.fired.bed, true);
});

test("notIn waits until outside", function () {
  Game.newGame();
  Game.go("b");
  Game.click("door");
  waits(3);
  eq(Game.state.time, 1205);
  eq(Game.state.flags.open, undefined);
  Game.go("b");
  eq(Game.state.flags.open, true);
});

test("nextEntry fires only on entry into a room with the group", function () {
  Game.newGame();
  waits(3);
  Game.go("c");
  eq(Game.state.flags.ghostOn, undefined);
  Game.go("a");
  Game.go("b");
  eq(Game.state.flags.ghostOn, true);
});

test("inRoom fires at once when already in the room", function () {
  Game.newGame();
  Game.go("c");
  var r = waits(4);
  ok(has(r.texts, "Glass"), JSON.stringify(r.texts));
});

test("textAway is used for now events with a room when elsewhere", function () {
  Game.newGame();
  ok(has(waits(5).texts, "Away"), "away text in a");
  Game.newGame();
  Game.go("c");
  ok(has(waits(4).texts, "Here"), "here text in c");
});

test("beam arms flags at time and fires on beamTouched", function () {
  Game.newGame();
  Game.go("c");
  waits(4);
  eq(Game.state.flags.face, true);
  eq(Game.state.fired.peek, undefined);
  var r = Game.beamTouched("face");
  eq(r.shake, true);
  eq(Game.state.flags.faceClose, true);
});

test("beamTouched before time does nothing", function () {
  Game.newGame();
  Game.go("c");
  Game.beamTouched("face");
  eq(Game.state.fired.peek, undefined);
});

test("beam fallback after N actions in a room with the group", function () {
  Game.newGame();
  Game.go("c");
  waits(4);
  Game.click("clock");
  Game.click("clock");
  var r = Game.click("clock");
  ok(has(r.texts, "Knock"), JSON.stringify(r.texts));
  ok(has(r.sounds, "knock"), "knock sound");
  eq(Game.state.fired.peek, true);
});

test("armed events do not block later now events", function () {
  Game.newGame();
  Game.editJump("a", "20:57");
  delete Game.state.fired.ghost;
  eq(Game.wait().ending, "WIN");
});

test("checkpoint is a deep copy taken just before the event", function () {
  Game.newGame();
  waits(2);
  eq(Game.checkpoint.eventId, "e2");
  eq(Game.checkpoint.state.flags.x, true);
  eq(Game.checkpoint.state.fired.e2, undefined);
  Game.wait();
  eq(Game.checkpoint.eventId, "bed");
  eq(Game.checkpoint.state.flags.asleep, undefined);
  Game.state.flags.zz = true;
  eq(Game.checkpoint.state.flags.zz, undefined);
});

test("editJump marks earlier events done and applies their flags silently", function () {
  Game.newGame();
  Game.editJump("b", "20:05");
  eq(Game.state.fired.e1, true);
  eq(Game.state.flags.x, true);
  eq(Game.state.room, "b");
  eq(Game.state.time, 1205);
  eq(Game.state.danger, null);
  ok(!has(Game.wait().texts, "E1 text"), "no replay of e1");
});

test("setFlag toggles a flag", function () {
  Game.newGame();
  Game.setFlag("lit", true);
  eq(Game.state.flags.lit, true);
  Game.setFlag("lit", false);
  eq(Game.state.flags.lit, undefined);
});

test("after waits until the named event has happened", function () {
  Game.newGame();
  waits(2);
  eq(Game.state.flags.lateOn, undefined, "late is due but ghost hasn't happened");
  waits(2);
  Game.go("b");
  eq(Game.state.flags.ghostOn, true);
  Game.click("note");
  eq(Game.state.flags.lateOn, true);
});
