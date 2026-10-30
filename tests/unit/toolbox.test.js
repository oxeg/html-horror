// The toolbox: the blocks rules.js is made of, and how the engine runs her scripts.
function scratch() {
  return { texts: [], sounds: [], shake: false, ending: null, problems: [] };
}

// Puts a rule made by when() first in the fixture's EVENTS while fn runs.
function withRule(rule, fn) {
  EVENTS.unshift(rule);
  try {
    fn();
  } finally {
    EVENTS.splice(EVENTS.indexOf(rule), 1);
  }
}

// Gives a fixture hotspot the whenClicked script just written while fn runs, then puts back the
// one the loader gave it from tests/fixtures/rules.js (if it had one).
function withScript(roomId, id, fn) {
  var h = ROOM_INFO[roomId].hotspots[id];
  var own = h.run;
  h.run = Toolbox.clickScripts()[id].run;
  try {
    fn();
  } finally {
    if (own) h.run = own;
    else delete h.run;
  }
}

test("rules sort by time and share a time with #2", function () {
  Toolbox.reset();
  when("20:00", function () {}); when("19:30", function () {}); when("20:00", function () {});
  eq(Toolbox.rules().map(function (r) { return r.id; }), ["19:30", "20:00", "20:00 #2"]);
});

test("lightFinds is a beam rule that shows its thing", function () {
  Toolbox.reset();
  when("22:20", lightFinds("face", 3), function () {});
  var r = Toolbox.rules()[0];
  eq([r.trigger, r.group, r.fallback, r.armShow], ["beam", "face", 3, ["face"]]);
});

test("the other conditions fill in the rule, and it remembers its line", function () {
  Toolbox.reset();
  var fn = function () {};
  when("21:50", afterRule("21:20"), notIn("master", "walk-in"), fn);
  when("21:40", inRoom("living"), fn);
  when("21:20", enteringRoomWith("not-sister"), fn);
  var r = Toolbox.rules();
  eq([r[0].trigger, r[0].group], ["nextEntry", "not-sister"]);
  eq([r[1].trigger, r[1].room], ["inRoom", "living"]);
  eq([r[2].trigger, r[2].after, r[2].notIn, r[2].armShow], ["now", "21:20", ["master", "walk-in"], []]);
  ok(r[2].run === fn, "run is the script");
  ok(r[2].line > 0 && r[2].line === r[1].line - 1, "line " + r[2].line + " / " + r[1].line);
});

test("whenClicked remembers its script and line", function () {
  Toolbox.reset();
  var fn = function () {};
  whenClicked("rug", fn);
  ok(Toolbox.clickScripts().rug.run === fn, "run");
  ok(Toolbox.clickScripts().rug.line > 0, "line");
});

test("setup calls change the settings; reset brings back the defaults", function () {
  Toolbox.reset();
  eq(Toolbox.settings(), { startTime: "19:00", startRoom: "entrance", moveMinutes: 10, lookMinutes: 10, waitMinutes: 15 });
  startAt("20:00", "hall"); walkingTakes(5); lookingTakes(3); waitingTakes(30);
  eq(Toolbox.settings(), { startTime: "20:00", startRoom: "hall", moveMinutes: 5, lookMinutes: 3, waitMinutes: 30 });
  Toolbox.reset();
  eq(Toolbox.settings().startTime, "19:00");
});

test("translate turns her words into the engine's", function () {
  Toolbox.reset();
  eq(Toolbox.translate({ clicks: 5, safe: click("bath-lock"), ending: "e6",
      deadly: click("laundry-lock", { ending: "e5" }),
      thenWait: { button: "Count", steps: ["10…", { say: "50…", sound: "knock", shake: true }], otherClicks: "Keep" },
      whenSafe: { say: "Silence.", hide: "face" } }),
    { deadline: 5, steps: [{ hotspot: "bath-lock" }], late: "e6", fatal: [{ hotspot: "laundry-lock", ending: "e5" }],
      hold: { button: "Count", steps: [{ text: "10…" }, { text: "50…", sound: "knock", shake: true }], keep: "Keep", fatal: "e6" },
      whenSafe: { text: "Silence.", hide: ["face"] } });
});

test("translate: rooms, leaving, anything in a room, a step's moment, lasts, buttonSays, thenWait's ending", function () {
  Toolbox.reset();
  var spec = {
    safe: [click("kid", { say: "Up you go.", show: "carry" }), beIn(["b", "closet"]), leaveRoom("c")],
    ending: "X2",
    deadly: [anythingIn("c"), click("trap", { ending: "X1" })],
    lasts: 3, waitEndsIt: true,
    buttonSays: { lamp: "Not now" }, labels: { lamp: "Run" },
    thenWait: { button: "Wait", steps: ["1"], labels: { coat: "Open it" }, ending: "X3" },
    whenSafe: "Safe",
  };
  var def = Toolbox.translate(spec);
  eq(def, {
    steps: [{ hotspot: "kid", then: { text: "Up you go.", show: ["carry"] } }, { room: ["b", "closet"] }, { leave: "c" }],
    late: "X2",
    fatal: [{ room: "c", ending: "X2" }, { hotspot: "trap", ending: "X1" }],
    endure: 3, waitEnds: true,
    say: { lamp: "Not now" }, labels: { lamp: "Run" },
    hold: { button: "Wait", steps: [{ text: "1" }], labels: { coat: "Open it" }, fatal: "X3" },
    whenSafe: { text: "Safe" },
  });
  spec.labels.lamp = "Changed later";
  eq(def.labels.lamp, "Run", "translate made its own copy");
});

test("danger() refuses functions", function () {
  Toolbox.reset();
  var message = null;
  try {
    Toolbox.translate({ whenSafe: function () {} });
  } catch (e) {
    message = e.message;
  }
  eq(message, "danger() can't hold a function");
  message = null;
  try {
    Toolbox.translate({ thenWait: { steps: ["1", { say: "2", show: function () {} }] } });
  } catch (e) {
    message = e.message;
  }
  eq(message, "danger() can't hold a function", "deep inside too");
});

test("a script's say replaces the button's text; without say the text still shows", function () {
  Toolbox.reset();
  whenClicked("rug", function () { say("Dust under the rug."); });
  withScript("a", "rug", function () {
    Game.newGame();
    eq(Game.click("rug").texts, ["Dust under the rug."]);
  });
  Toolbox.reset();
  whenClicked("rug", function () { playSound("knock"); });
  withScript("a", "rug", function () {
    Game.newGame();
    var r = Game.click("rug");
    eq(r.texts, ["A rug."]);
    eq(r.sounds, ["knock"]);
  });
});

test("a click's endGame ends the game; a danger from a click is ignored", function () {
  Toolbox.reset();
  whenClicked("rug", function () { endGame("X1"); });
  withScript("a", "rug", function () {
    Game.newGame();
    eq(Game.click("rug").ending, "X1");
    eq(Game.state.ending, "X1");
  });
  Toolbox.reset();
  whenClicked("rug", function () { danger({ clicks: 2, safe: beIn("b"), ending: "X2" }); });
  withScript("a", "rug", function () {
    Game.newGame();
    Game.click("rug");
    eq(Game.state.danger, null);
  });
});

test("show inside a script is seen by isShown later in the same script", function () {
  Toolbox.reset();
  var rule = when("19:05", function () {
    show("lit");
    say(isShown("lit") ? "The lamp is on." : "Still dark.");
    hide("lit");
    if (!isShown("lit")) say("Off again.");
  });
  withRule(rule, function () {
    Game.newGame();
    eq(Game.wait().texts, ["The lamp is on.", "Off again."]);
    eq(Game.state.shown.lit, false);
    eq(Game.state.fired["19:05"], true);
  });
});

test("a rule's script starts its danger, and Try again declares it afresh", function () {
  Toolbox.reset();
  var rule = when("19:05", function () {
    say("Run!");
    danger({ clicks: 3, safe: beIn("b"), ending: "X2" });
  });
  withRule(rule, function () {
    Game.newGame();
    eq(Game.wait().texts, ["Run!"]);
    eq(Game.state.danger.id, "19:05");
    eq(Game.state.danger.def, { deadline: 3, steps: [{ room: "b" }], late: "X2" });
    Game.wait();
    Game.wait();
    eq(Game.wait().ending, "X2");
    eq(Game.tryAgain().texts, ["Run!"]);
    eq([Game.state.ending, Game.state.danger.id, Game.state.danger.used], [null, "19:05", 0]);
    Game.go("b");
    eq(Game.state.danger, null, "safe in b");
  });
});

test("a save in the middle of a rule's danger can be continued", function () {
  Toolbox.reset();
  var rule = when("19:05", function () { danger({ clicks: 3, safe: beIn("b"), ending: "X2" }); });
  withRule(rule, function () {
    withStorage(fakeStorage(false), function () { // both from danger.test.js
      Game.newGame();
      Game.wait();
      eq(Game.state.danger.id, "19:05");
      ok(Game.hasSave(), "Continue is offered");
      Game.state = null;
      ok(Game.continueGame(), "continued");
      eq([Game.state.danger.id, Game.state.danger.def.late], ["19:05", "X2"]);
      Game.go("b");
      eq(Game.state.danger, null, "and it goes on");
    });
  });
});

test("pretend gives a rule's danger and ending, and puts the game back", function () {
  Toolbox.reset();
  var rule = when("19:05", function () {
    show("lit");
    lightsOut();
    say("Run!");
    playSound("knock");
    danger({ clicks: 3, safe: beIn("b"), ending: "X2" });
  });
  var home = when("21:00", function () { endGame("WIN"); });
  Game.newGame();
  var before = JSON.stringify(Game.state);
  eq(Toolbox.pretend(rule), { danger: { deadline: 3, steps: [{ room: "b" }], late: "X2" }, ending: null, problems: [] });
  eq(Toolbox.pretend(home), { danger: null, ending: "WIN", problems: [] });
  eq(JSON.stringify(Game.state), before, "the game is just as it was");
  var keep = Game.state;
  Game.state = null; // before the first game, which is when check.js runs
  try {
    eq(Toolbox.pretend(rule).danger.late, "X2", "a script that shows things first still gets to its danger");
    eq(Game.state, null, "still no game");
  } finally {
    Game.state = keep;
  }
});

test("a rule's endGame ends the game", function () {
  Toolbox.reset();
  var rule = when("19:05", function () { playSound("keys"); endGame("WIN"); });
  withRule(rule, function () {
    Game.newGame();
    var r = Game.wait();
    eq([r.ending, r.sounds], ["WIN", ["keys"]]);
  });
});

test("a click step with no room counts in any room, by id or by class", function () {
  Toolbox.reset();
  var rule = when("19:05", function () { danger({ clicks: 5, safe: click("light"), ending: "X2" }); });
  withRule(rule, function () {
    Game.newGame();
    Game.go("c");
    eq(Game.state.danger.id, "19:05");
    Game.click("lamp"); // lamp's names are ["lamp", "light"]
    eq(Game.state.danger, null);
  });
});

test("the checks read the game: youAreIn, clockIsBefore, isDark, foundWithLight", function () {
  Toolbox.reset();
  Game.newGame();
  var seen = [];
  function look() { seen.push([youAreIn("a"), clockIsBefore("19:30"), isDark(), foundWithLight()]); }
  Toolbox.run(look, { r: scratch() });
  Game.go("c"); Game.setDark(true);
  Toolbox.run(look, { r: scratch(), byFallback: true });
  eq(seen, [[true, true, false, true], [false, true, true, false]]);
});

test("lightsOut and lightsOn switch the lights at once", function () {
  Toolbox.reset();
  Game.newGame();
  var seen = [];
  Toolbox.run(function () { lightsOut(); seen.push(isDark()); lightsOn(); seen.push(isDark()); lightsOut(); }, { r: scratch() });
  eq(seen, [true, false]);
  eq(Game.state.dark, true);
});

test("silent mode drops words and sounds but keeps show and hide", function () {
  Toolbox.reset();
  Game.newGame();
  var r = scratch();
  var out = Toolbox.run(function () {
    say("Boo."); playSound("knock"); shake();
    show("lit"); hide("x");
    danger({ clicks: 2, safe: beIn("b"), ending: "X2", whenSafe: { hide: "lit" } });
  }, { r: r, silent: true });
  eq([r.texts, r.sounds, r.shake], [[], [], false]);
  eq([Game.state.shown.lit, Game.state.shown.x], [true, false]);
  eq(out.danger.late, "X2", "the danger comes back");
  eq(Game.state.danger, null, "but it doesn't start");
});

test("edit mode's jump runs earlier scripts silently and applies their whenSafe", function () {
  Toolbox.reset();
  var rule = when("19:05", function () {
    say("Boo.");
    show("lit", "ghost");
    danger({ clicks: 2, safe: beIn("b"), ending: "X2", whenSafe: { say: "Phew.", hide: "ghost" } });
  });
  withRule(rule, function () {
    Game.newGame();
    Game.editJump("c", "19:10");
    eq([Game.state.shown.lit, Game.state.shown.ghost], [true, false]);
    eq([Game.state.danger, Game.state.fired["19:05"]], [null, true]);
    ok(Game.wait().texts.indexOf("Boo.") < 0, "no replay");
  });
});

test("a mistake inside a script becomes a problem, and the game goes on", function () {
  Toolbox.reset();
  whenClicked("lamp", function () { sya("Click!"); });
  withScript("c", "lamp", function () {
    Game.newGame();
    Game.go("c");
    var r = Game.click("lamp");
    eq(r.problems.length, 1);
    eq(r.problems[0].file, "rules.js");
    ok(r.problems[0].line > 0, "line " + r.problems[0].line);
    ok(r.problems[0].message.indexOf("sya") >= 0, r.problems[0].message);
    ok(r.texts.indexOf("Click.") >= 0, "the button's own text still shows");
    eq(Game.state.time, 1160, "time still advances");
  });
});

test("a block used outside a script says so", function () {
  Toolbox.reset();
  var message = null;
  try {
    say("Hi");
  } catch (e) {
    message = e.message;
  }
  ok(message && message.indexOf("say()") === 0, message);
});

test("pretend gives the mistakes a script made, with their lines", function () {
  Toolbox.reset();
  var rule = when("19:05", function () {
    say("Run!");
    sya("Run!");
  });
  var got = Toolbox.pretend(rule);
  eq(got.problems.length, 1);
  eq(got.problems[0].file, "rules.js");
  eq(got.problems[0].line, rule.line + 2, "the line of the mistake");
  ok(got.problems[0].message.indexOf("sya") >= 0, got.problems[0].message);
});

test("a rule remembers every trigger it was given", function () {
  Toolbox.reset();
  when("21:00", inRoom("c"), notIn("a"), lightFinds("face", 3), function () {});
  when("21:10", function () {});
  var r = Toolbox.rules();
  eq(r[0].triggers, ["inRoom", "beam"]);
  eq(r[1].triggers, []);
});

test("the list of blocks is every block there is", function () {
  ok(Toolbox.blocks.length > 20, "blocks: " + Toolbox.blocks.length);
  Toolbox.blocks.forEach(function (name) { eq(typeof globalThis[name], "function", name); });
  ["when", "whenClicked", "say", "show", "danger", "beIn", "afterRule"].forEach(function (name) {
    ok(Toolbox.blocks.indexOf(name) >= 0, name);
  });
});

test("calls reads a script's calls without running it", function () {
  var calls = Toolbox.calls(function () {
    show("a", ["b"]);   // "say(not a call)"
    x.hide(isShown("c") ? "d" : 'e');
    function own() {}
    /* sya(
       */ say(`f`, `g ${1}`);
  });
  eq(calls.map(function (c) { return [c.name, c.line, c.method, c.declared, c.words]; }), [
    ["function", 1, false, false, []],
    ["show", 2, false, false, ["a", "b"]],
    ["hide", 3, true, false, ["d", "e"]],
    ["isShown", 3, false, false, ["c"]],
    ["own", 4, false, true, []],
    ["say", 6, false, false, ["f"]],
  ]);
});
