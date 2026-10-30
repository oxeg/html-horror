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
  eq(Game.state.shown.x, true);
  eq(Game.state.fired["19:20"], true);
});

test("events crossed together fire in list order", function () {
  Game.newGame();
  eq(waits(2).texts, ["E1 text", "E2 text"]);
});

test("unlessShown fires silently", function () {
  Game.newGame();
  Game.setShown("asleep", true);
  waits(2);
  var r = Game.wait();
  ok(!has(r.texts, "Bed"), "no Bed text");
  eq(Game.state.fired["19:40"], true);
});

test("notIn waits until outside", function () {
  Game.newGame();
  Game.go("b");
  Game.click("door");
  waits(3);
  eq(Game.state.time, 1205);
  eq(Game.state.shown.open, undefined);
  Game.go("b");
  eq(Game.state.shown.open, true);
});

test("nextEntry fires only on entry into a room with the group", function () {
  Game.newGame();
  waits(3);
  Game.go("c");
  eq(Game.state.shown.ghost, undefined);
  Game.go("a");
  Game.go("b");
  eq(Game.state.shown.ghost, true);
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

test("beam arms its names at time and fires on beamTouched", function () {
  Game.newGame();
  Game.go("c");
  waits(4);
  eq(Game.state.shown.face, true);
  eq(Game.state.fired["20:10"], undefined);
  var r = Game.beamTouched("face");
  eq(r.shake, true);
  eq(Game.state.shown["face-close"], true);
});

test("beamTouched before time does nothing", function () {
  Game.newGame();
  Game.go("c");
  Game.beamTouched("face");
  eq(Game.state.fired["20:10"], undefined);
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
  eq(Game.state.fired["20:10"], true);
});

test("armed events do not block later now events", function () {
  Game.newGame();
  Game.editJump("a", "20:57");
  delete Game.state.fired["19:50"];
  eq(Game.wait().ending, "WIN");
});

test("checkpoint is a deep copy taken just before the event", function () {
  Game.newGame();
  waits(2);
  eq(Game.checkpoint.eventId, "19:20 #2");
  eq(Game.checkpoint.state.shown.x, true);
  eq(Game.checkpoint.state.fired["19:20 #2"], undefined);
  Game.wait();
  eq(Game.checkpoint.eventId, "19:40");
  eq(Game.checkpoint.state.shown.asleep, undefined);
  Game.state.shown.zz = true;
  eq(Game.checkpoint.state.shown.zz, undefined);
});

test("editJump marks earlier events done and applies their show and hide silently", function () {
  Game.newGame();
  Game.editJump("b", "20:05");
  eq(Game.state.fired["19:20"], true);
  eq(Game.state.shown.x, true);
  eq(Game.state.room, "b");
  eq(Game.state.time, 1205);
  eq(Game.state.danger, null);
  ok(!has(Game.wait().texts, "E1 text"), "no replay of e1");
});

test("setShown stores a name's value, setDark the lights", function () {
  Game.newGame();
  Game.setShown("lit", true);
  eq(Game.state.shown.lit, true);
  Game.setShown("lit", false);
  eq(Game.state.shown.lit, false);
  Game.setDark(true);
  eq(Game.state.dark, true);
  Game.setDark(false);
  eq(Game.state.dark, false);
});

test("lights out is its own state", function () {
  Game.newGame(); Game.wait(); Game.wait();
  eq(Game.state.dark, true);
});

test("after waits until the named event has happened", function () {
  Game.newGame();
  waits(2);
  eq(Game.state.shown.lateOn, undefined, "late is due but ghost hasn't happened");
  waits(2);
  Game.go("b");
  eq(Game.state.shown.ghost, true);
  Game.click("note");
  eq(Game.state.shown.lateOn, true);
});

test("notIn holds a nextEntry rule too", function () {
  Game.newGame();
  Game.editJump("b", "19:45");
  Game.click("door"); // into the closet, which has a ghost too
  eq(Game.state.fired["19:50"], undefined, "not in the closet");
  Game.go("b");
  eq(Game.state.fired["19:50"], true);
});
