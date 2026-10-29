// Dangers: steps, deadlines, fatal clicks, holds, endure, endings, retry and save.
function contains(list, item) {
  return list.indexOf(item) >= 0;
}

// Starts the "hide" danger while standing in roomId.
function startHide(roomId) {
  Game.newGame();
  Game.editJump(roomId, "20:19");
  Game.wait();
  eq(Game.state.danger.id, "hide");
}

function fakeStorage(throws) {
  var data = {};
  return {
    data: data,
    getItem: function (k) {
      if (throws) throw new Error("no storage");
      return k in data ? data[k] : null;
    },
    setItem: function (k, v) {
      if (throws) throw new Error("no storage");
      data[k] = String(v);
    },
    removeItem: function (k) {
      if (throws) throw new Error("no storage");
      delete data[k];
    },
  };
}

function withStorage(storage, fn) {
  globalThis.localStorage = storage;
  Game.useStorage(true);
  try {
    fn();
  } finally {
    Game.useStorage(false);
    delete globalThis.localStorage;
  }
}

test("danger freezes the clock", function () {
  startHide("a");
  var time = Game.state.time;
  Game.go("b");
  eq(Game.state.time, time);
});

test("steps must be done in order", function () {
  Game.newGame();
  Game.editJump("b", "20:50");
  Game.click("note");
  eq(Game.state.danger.id, "pick");
  Game.go("a");
  Game.go("b");
  eq(Game.state.danger.id, "pick");
  eq(Game.state.danger.step, 0);
});

test("finishing the steps starts the hold with its button and labels", function () {
  startHide("a");
  Game.go("b");
  Game.click("door");
  eq(Game.state.danger.holding, true);
  eq(Game.waitLabel(), "Count");
  eq(Game.label("coat"), "Open it");
});

test("hold steps play texts sounds and shake, then resolve", function () {
  startHide("a");
  Game.go("b");
  Game.click("door");
  eq(Game.wait().texts, ["1"]);
  var r = Game.wait();
  ok(contains(r.texts, "2") && contains(r.texts, "Safe"), JSON.stringify(r.texts));
  eq(r.shake, true);
  ok(contains(r.sounds, "knock"), "knock");
  eq(Game.state.danger, null);
  eq(Game.state.flags.x, undefined);
});

test("any other action during hold is hold.fatal", function () {
  startHide("a");
  Game.go("b");
  Game.click("door");
  eq(Game.go("b").ending, "X3");
});

test("deadline counts every action and the completing action always succeeds", function () {
  startHide("a");
  Game.wait();
  Game.wait();
  Game.go("b");
  var r = Game.click("door");
  eq(r.ending, null);
  eq(Game.state.danger.holding, true);
  startHide("a");
  Game.wait();
  Game.wait();
  Game.wait();
  eq(Game.wait().ending, "X2");
});

test("fatal is checked before steps", function () {
  startHide("a");
  Game.go("c");
  eq(Game.click("trap").ending, "X1");
});

test("say and labels override while the danger runs", function () {
  startHide("c");
  eq(Game.click("lamp").texts, ["Not now"]);
  eq(Game.label("lamp"), "Run");
  Game.editJump("c", "20:35");
  eq(Game.label("lamp"), "Lamp");
});

test("endure resolves after N actions or one Wait", function () {
  Game.newGame();
  Game.editJump("a", "20:40");
  Game.click("rug");
  eq(Game.state.danger.id, "wait1");
  Game.click("rug");
  Game.click("rug");
  ok(contains(Game.click("rug").texts, "Gone"), "gone after three");
  Game.newGame();
  Game.editJump("a", "20:40");
  Game.click("rug");
  ok(contains(Game.wait().texts, "Gone"), "gone after a wait");
  eq(Game.state.danger, null);
});

test("room-only fatal matches any hotspot there", function () {
  Game.newGame();
  Game.editJump("c", "20:40");
  Game.click("lamp");
  eq(Game.state.danger.id, "wait1");
  eq(Game.click("kid").ending, "X1");
});

test("step setFlags and array rooms", function () {
  Game.newGame();
  Game.editJump("c", "20:50");
  Game.click("lamp");
  Game.click("kid");
  eq(Game.state.flags.carry, true);
  Game.go("a");
  Game.go("b");
  eq(Game.state.danger, null);
});

test("unlessFlag fatal", function () {
  Game.newGame();
  Game.editJump("b", "20:50");
  Game.click("note");
  eq(Game.click("door").ending, "X3");
});

test("leave step", function () {
  Game.newGame();
  Game.editJump("c", "20:55");
  Game.click("lamp");
  eq(Game.state.danger.id, "leaveC");
  Game.go("a");
  eq(Game.state.danger, null);
});

test("due event fires right after a danger resolves", function () {
  Game.newGame();
  Game.editJump("a", "20:40");
  Game.wait();
  eq(Game.state.danger.id, "wait1");
  Game.wait();
  eq(Game.state.danger.id, "pick");
});

test("armed trigger waits for the danger to end", function () {
  Game.newGame();
  Game.editJump("a", "20:19");
  delete Game.state.fired.ghost;
  Game.setFlag("ghostOn", false);
  Game.wait();
  eq(Game.state.danger.id, "hide");
  Game.go("b");
  eq(Game.state.flags.ghostOn, undefined);
  Game.click("door");
  Game.wait();
  Game.wait();
  eq(Game.state.danger, null);
  Game.go("b");
  eq(Game.state.flags.ghostOn, true);
});

test("dangerLevel rises with used actions", function () {
  startHide("a");
  eq(Game.dangerLevel(), 0);
  Game.wait();
  eq(Game.dangerLevel(), 0.25);
});

test("endings are recorded once", function () {
  Game.newGame();
  Game.go("c");
  Game.click("trap");
  Game.newGame();
  Game.go("c");
  Game.click("trap");
  eq(Game.endingsFound().filter(function (e) { return e === "X1"; }).length, 1);
  var storage = fakeStorage(false);
  withStorage(storage, function () {
    Game.newGame();
    Game.go("c");
    Game.click("trap");
    Game.newGame();
    ok(contains(JSON.parse(storage.data["babysitting-rules:endings"]), "X1"), "stored");
    ok(contains(Game.endingsFound(), "X1"), "still found after newGame");
  });
});

test("tryAgain restores the checkpoint and re-fires its event", function () {
  startHide("a");
  var before = Game.checkpoint.state;
  Game.wait();
  Game.wait();
  Game.wait();
  eq(Game.wait().ending, "X2");
  Game.tryAgain();
  eq(Game.state.ending, null);
  eq(Game.state.danger.id, "hide");
  eq(Game.state.danger.used, 0);
  eq(Game.state.time, before.time);
  eq(Game.state.room, before.room);
});

test("startOver equals newGame", function () {
  startHide("a");
  Game.go("c");
  Game.click("trap");
  Game.startOver();
  eq(Game.state.time, 1140);
  eq(Game.state.room, "a");
  eq(Game.state.fired, {});
  ok(contains(Game.endingsFound(), "X1"), "endings kept");
});

test("save and continue", function () {
  withStorage(fakeStorage(false), function () {
    startHide("a");
    Game.go("b");
    var saved = JSON.stringify(Game.state);
    Game.state.time = 0;
    ok(Game.hasSave(), "has save");
    ok(Game.continueGame(), "continued");
    eq(JSON.stringify(Game.state), saved);
  });
});

test("load ignores a save that names an unknown room", function () {
  var storage = fakeStorage(false);
  withStorage(storage, function () {
    Game.newGame();
    var bad = JSON.parse(storage.data["babysitting-rules:save"]);
    bad.state.room = "zz";
    storage.data["babysitting-rules:save"] = JSON.stringify(bad);
    eq(Game.hasSave(), false);
    eq(Game.continueGame(), false);
  });
});

test("storage that throws does not break play", function () {
  withStorage(fakeStorage(true), function () {
    Game.newGame();
    Game.go("b");
    Game.wait();
    eq(Game.state.room, "b");
    eq(Game.hasSave(), false);
  });
});

test("harmless clicks during a hold don't break it", function () {
  startHide("a");
  Game.go("b");
  Game.click("door");
  var r = Game.click("box");
  eq(r.ending, null);
  eq(r.texts, ["Keep counting"]);
  eq(Game.state.danger.holding, true);
  eq(Game.state.danger.held, 0);
  Game.wait();
  ok(Game.wait().texts.indexOf("Safe") >= 0, "the hold still finishes");
});

test("a hotspot named in hold.labels is fatal during the hold", function () {
  startHide("a");
  Game.go("b");
  Game.click("door");
  eq(Game.click("coat").ending, "X3");
});
