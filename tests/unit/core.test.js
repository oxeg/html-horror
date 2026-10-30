// Engine core: clock, moving, looking, notes, camera, endings.
var EMPTY = { texts: [], sounds: [], shake: false, ending: null };

test("newGame starts at start time and room", function () {
  Game.useStorage(false);
  Game.newGame();
  eq(Game.state.time, 1140);
  eq(Game.state.room, "a");
  eq(Game.clock(), "19:00");
});

test("go to an exit costs moveMinutes", function () {
  Game.newGame();
  Game.go("b");
  eq(Game.state.time, 1150);
  eq(Game.state.room, "b");
});

test("go to a non-exit is ignored", function () {
  Game.newGame();
  eq(Game.go("closet"), EMPTY);
  eq(Game.state.room, "a");
  eq(Game.state.time, 1140);
});

test("look costs lookMinutes and returns text", function () {
  Game.newGame();
  Game.go("c");
  var r = Game.click("lamp");
  ok(r.texts.indexOf("Click.") >= 0, "lamp text");
  eq(Game.state.shown.lit, true);
  eq(Game.state.time, 1160);
});

test("minutes override", function () {
  Game.newGame();
  Game.click("rug");
  eq(Game.state.time, 1140);
});

test("note hotspot adds note once and costs 0", function () {
  Game.newGame();
  Game.go("b");
  Game.click("note");
  Game.click("note");
  eq(Game.state.notes, ["n1"]);
  eq(Game.state.time, 1150);
});

test("goTo moves room", function () {
  Game.newGame();
  Game.go("b");
  Game.click("door");
  eq(Game.state.room, "closet");
});

test("wait adds waitMinutes", function () {
  Game.newGame();
  Game.wait();
  eq(Game.state.time, 1155);
});

test("notBefore shows tooEarly and applies nothing", function () {
  Game.newGame();
  Game.go("c");
  var r = Game.click("kid");
  eq(r.texts[0], "Too early");
  ok(r.texts.indexOf("Goodnight.") < 0, "no goodnight text");
  eq(Game.state.shown.asleep, undefined);
});

test("camera opens overlay scene", function () {
  Game.newGame();
  Game.go("c");
  Game.click("cam");
  eq(Game.state.camera, true);
  eq(Game.scene(), "feed");
  eq(Game.click("talk").texts, ["Static."]);
  var time = Game.state.time;
  Game.closeCamera();
  eq(Game.state.camera, false);
  eq(Game.state.time, time);
  eq(Game.scene(), "c");
});

test("trap ending ends the game", function () {
  Game.newGame();
  Game.go("c");
  var r = Game.click("trap");
  eq(r.ending, "X1");
  eq(Game.state.ending, "X1");
});

test("actions after an ending do nothing", function () {
  Game.newGame();
  Game.go("c");
  Game.click("trap");
  var before = JSON.stringify(Game.state);
  eq(Game.go("a"), EMPTY);
  eq(Game.click("lamp"), EMPTY);
  eq(Game.wait(), EMPTY);
  eq(JSON.stringify(Game.state), before);
});

test("roomHas finds data-name and data-hotspot", function () {
  eq(Game.roomHas("b", "ghost"), true);
  eq(Game.roomHas("b", "door"), true);
  eq(Game.roomHas("a", "ghost"), false);
});

test("names: the first stored name decides, id first", function () {
  Game.newGame();
  eq(Game.isVisible(["a", "b"], true), false);
  Game.setShown("b", true);  eq(Game.isVisible(["a", "b"], true), true);
  Game.setShown("a", false); eq(Game.isVisible(["a", "b"], true), false);
});

test("a hidden hotspot can't be used", function () {
  Game.newGame(); Game.go("c");
  var t = Game.state.time;
  eq(Game.click("ghostly").texts, []);
  eq(Game.state.time, t);
});

test("a drawing part follows the hotspot with its name", function () {
  Game.newGame();
  eq(Game.partVisible("c", "ghostly", false), false);
  Game.setShown("ghostly", true);
  eq(Game.partVisible("c", "ghostly", false), true);
});

test("a drawing part with no hotspot follows its data-hidden", function () {
  Game.newGame();
  eq(Game.partVisible("b", "ghost", true), false);
  eq(Game.partVisible("b", "picture", false), true);
  Game.setShown("ghost", true);
  eq(Game.partVisible("b", "ghost", true), true);
});

test("isShown: the stored value, then the hotspot, then a hidden drawing part, else shown", function () {
  Game.newGame();
  eq(Game.isShown("ghostly"), false, "a hidden hotspot");
  eq(Game.isShown("light"), true, "a hotspot by one of its names");
  eq(Game.isShown("ghost"), false, "a data-hidden drawing part");
  eq(Game.isShown("anything"), true, "a name nothing hides");
  Game.setShown("ghost", true);
  Game.setShown("light", false);
  eq([Game.isShown("ghost"), Game.isShown("light")], [true, false], "the stored value wins");
});

test("formatTime/parseTime round-trip", function () {
  eq(Game.formatTime(Game.parseTime("23:05")), "23:05");
});
