// Random nights: between() and onSomeNights() in rules.js, the night rolled when a new game starts,
// and what keeps it (Continue, Try again) or rolls it again (a new game).

// A random that gives these numbers in turn, again and again.
function randoms(values) {
  var i = 0;
  return function () { return values[i++ % values.length]; };
}

// The night a fixture game rolls (every fixture rule has one time), with some of it changed.
function fixtureNight(changes) {
  var night = Toolbox.rollNight(EVENTS);
  for (var id in changes) night[id] = changes[id];
  return night;
}

function at(time) { return Game.parseTime(time); }

test("between gives a rule a window; its id and its sorting stay its first time", function () {
  Toolbox.reset();
  when("21:30", function () {});
  when(between("21:10", "22:10"), function () {});
  var r = Toolbox.rules();
  eq([r[0].id, r[0].time, r[0].latest], ["21:10", "21:10", "22:10"]);
  eq([r[1].id, r[1].latest], ["21:30", undefined]);
});

test("onSomeNights is a condition with the odds", function () {
  Toolbox.reset();
  when("22:00", onSomeNights(9, 10), function () {});
  eq(Toolbox.rules()[0].odds, [9, 10]);
});

test("rollNight: a window's time is on its 5-minute steps, first to last; one time stays", function () {
  Toolbox.reset();
  when("19:00", function () {});
  when(between("21:10", "21:30"), function () {});
  var events = Toolbox.rules();
  eq(Toolbox.rollNight(events, randoms([0]))["21:10"], at("21:10"));
  eq(Toolbox.rollNight(events, randoms([0.99]))["21:10"], at("21:30"));
  var seen = {};
  for (var i = 0; i < 100; i++) {
    var night = Toolbox.rollNight(events, randoms([i / 100]));
    eq(night["19:00"], at("19:00"), "a plain time never moves");
    seen[Game.formatTime(night["21:10"])] = true;
  }
  eq(Object.keys(seen).sort(), ["21:10", "21:15", "21:20", "21:25", "21:30"]);
});

test("rollNight: only onSomeNights rules are skipped; n out of n never is, 0 out of n always is", function () {
  Toolbox.reset();
  when("19:00", function () {});
  when("19:10", onSomeNights(9, 10), function () {});
  when("19:20", onSomeNights(10, 10), function () {});
  when("19:30", onSomeNights(0, 10), function () {});
  var events = Toolbox.rules();
  var high = Toolbox.rollNight(events, randoms([0.95]));
  eq([high["19:00"], high["19:10"], high["19:20"], high["19:30"]], [at("19:00"), null, at("19:20"), null]);
  var low = Toolbox.rollNight(events, randoms([0.85]));
  eq([low["19:10"], low["19:20"], low["19:30"]], [at("19:10"), at("19:20"), null]);
});

test("rollNight keeps what a saved night has and rolls only the rules it doesn't have", function () {
  Toolbox.reset();
  when(between("21:00", "22:00"), function () {});
  when(between("21:10", "22:10"), function () {});
  var night = Toolbox.rollNight(Toolbox.rules(), randoms([0.99]), { "21:00": at("21:35") });
  eq(night, { "21:00": at("21:35"), "21:10": at("22:10") });
});

test("tonight and inTonightsOrder: tonight's times, ties by first time then rules.js order, skipped ones last", function () {
  Toolbox.reset();
  when("19:00", function () {});
  when(between("19:10", "20:00"), function () {});
  when(between("19:20", "20:00"), function () {});
  when(between("19:30", "20:00"), function () {});
  var events = Toolbox.rules();
  var state = { night: { "19:10": at("19:50"), "19:20": null, "19:30": at("19:50") } };
  eq(Toolbox.tonight(events[0], state), at("19:00"), "a rule the night doesn't have keeps its first time");
  eq(Toolbox.tonight(events[2], state), null);
  eq(Toolbox.inTonightsOrder(events, state).map(function (ev) { return ev.id; }), ["19:00", "19:10", "19:30", "19:20"]);
});

test("labelOf: the start of what a rule says without tags, else the first name it shows", function () {
  Toolbox.reset();
  when("19:00", function () { hide("door-closed"); show("door-open", "x"); });
  when("19:10", function () { show("glow"); playSound("click"); say("Somewhere in the flat,<br>a door clicks shut. Then nothing."); });
  when("19:20", function () { lightsOut(); });
  when("19:30", function () { say("Short."); });
  when("19:40", function () { say("Upstairs, someone knocks on the floor. Twice. Then nothing."); });
  var r = Toolbox.rules();
  eq(Toolbox.labelOf(r[0]), "door-open");
  eq(Toolbox.labelOf(r[1]), "Somewhere in the flat, a door clicks…");
  eq(Toolbox.labelOf(r[2]), "the rule at 19:20");
  eq(Toolbox.labelOf(r[3]), "Short.");
  eq(Toolbox.labelOf(r[4]), "Upstairs, someone knocks on the floor. Twice…", "no full stop before the …");
});

// ---- the engine: the night it plays ----

test("a new game rolls the night; a rule skipped tonight never fires", function () {
  Game.newGame();
  eq(Game.state.night["19:20"], at("19:20"));
  Game.newGame(fixtureNight({ "19:20": null }));
  var r = waits(2);
  ok(r.texts.indexOf("E1 text") < 0, JSON.stringify(r.texts));
  eq([Game.state.fired["19:20"], Game.state.shown.x], [undefined, undefined]);
});

test("a rule waits for tonight's time, and rules fire in tonight's order", function () {
  Game.newGame(fixtureNight({ "19:20": at("19:25"), "19:20 #2": at("19:20") }));
  eq(waits(2).texts, ["E2 text", "E1 text"]);
  Game.newGame(fixtureNight({ "19:20": at("19:35") }));
  eq(waits(2).texts, ["E2 text"]);
  ok(waits(1).texts.indexOf("E1 text") >= 0, "E1 at 19:45");
});

test("afterRule counts a rule skipped tonight as done", function () {
  Game.newGame(fixtureNight({ "19:50": null }));
  waits(2);
  eq(Game.state.shown.lateOn, true);
  Game.newGame();
  waits(2);
  eq(Game.state.shown.lateOn, undefined, "without the skip it still waits for 19:50");
});

test("Try again and Continue keep tonight; a new game rolls a new one", function () {
  withStorage(fakeStorage(false), function () {
    var night = fixtureNight({ "19:40": at("20:00") });
    Game.newGame(night);
    waits(2);
    Game.tryAgain();
    eq(Game.state.night, night, "Try again");
    Game.state.night = null;
    ok(Game.continueGame(), "continued");
    eq(Game.state.night, night, "Continue");
    Game.newGame();
    eq(Game.state.night["19:40"], at("19:40"), "a new game");
  });
});

test("edit mode's jump goes by tonight's times and leaves skipped rules alone", function () {
  Game.newGame(fixtureNight({ "19:20": null, "19:40": at("20:30") }));
  Game.editJump("a", "20:00");
  eq([Game.state.fired["19:20"], Game.state.shown.x], [undefined, undefined], "skipped");
  eq(Game.state.fired["19:40"], undefined, "tonight it's at 20:30");
  eq(Game.state.fired["19:20 #2"], true);
  Game.editJump("a", "19:10");
  eq(Game.state.night["19:20"], null, "still skipped");
});

test("a save keeps its night; one without a night, or naming a rule that's gone, is dropped", function () {
  var storage = fakeStorage(false);
  withStorage(storage, function () {
    Game.newGame();
    var saved = JSON.parse(storage.data["babysitting-rules:save"]);
    eq(saved.state.night, Game.state.night);
    var none = JSON.parse(JSON.stringify(saved));
    delete none.state.night;
    storage.data["babysitting-rules:save"] = JSON.stringify(none);
    eq(Game.hasSave(), false, "no night");
    var gone = JSON.parse(JSON.stringify(saved));
    gone.state.night["18:00"] = at("18:00");
    storage.data["babysitting-rules:save"] = JSON.stringify(gone);
    eq(Game.hasSave(), false, "a rule that's gone");
  });
});

test("a rule the saved night doesn't have yet is rolled when you continue", function () {
  var storage = fakeStorage(false);
  withStorage(storage, function () {
    Game.newGame(fixtureNight({ "19:40": at("20:00") }));
    var saved = JSON.parse(storage.data["babysitting-rules:save"]);
    delete saved.state.night["20:05"];
    storage.data["babysitting-rules:save"] = JSON.stringify(saved);
    ok(Game.continueGame(), "continued");
    eq([Game.state.night["19:40"], Game.state.night["20:05"]], [at("20:00"), at("20:05")]);
  });
});

test("earliest: a rule after another can't come before it tonight, unless that one is skipped", function () {
  Toolbox.reset();
  when(between("19:10", "20:00"), function () {});
  when(between("19:30", "20:00"), afterRule("19:10"), function () {});
  var events = Toolbox.rules();
  var state = { night: { "19:10": at("19:50"), "19:30": at("19:35") } };
  eq(Toolbox.earliest(events[1], state, events), at("19:50"));
  eq(Toolbox.earliest(events[0], state, events), at("19:50"));
  eq(Toolbox.inTonightsOrder(events, state).map(function (ev) { return ev.id; }), ["19:10", "19:30"]);
  state.night["19:10"] = null;
  eq(Toolbox.earliest(events[1], state, events), at("19:35"), "the one it waits for is skipped tonight");
});

test("edit mode's jump doesn't count a rule as done before the rule it waits for", function () {
  Game.newGame(fixtureNight({ "19:30": at("19:30") }));
  Game.editJump("a", "19:40");
  eq([Game.state.fired["19:30"], Game.state.shown.lateOn], [undefined, undefined], "19:50 hasn't come yet");
  Game.editJump("a", "20:00");
  eq([Game.state.fired["19:30"], Game.state.shown.lateOn], [true, true]);
});

test("Try again before any rule has fired keeps tonight", function () {
  var night = fixtureNight({ "19:40": at("20:00") });
  Game.newGame(night);
  eq(Game.checkpoint, null);
  Game.tryAgain();
  eq(Game.state.night, night);
});

test("Continue saves the times it rolled for the rules the saved night didn't have", function () {
  var storage = fakeStorage(false);
  withStorage(storage, function () {
    Game.newGame();
    var saved = JSON.parse(storage.data["babysitting-rules:save"]);
    delete saved.state.night["20:05"];
    storage.data["babysitting-rules:save"] = JSON.stringify(saved);
    ok(Game.continueGame(), "continued");
    eq(JSON.parse(storage.data["babysitting-rules:save"]).state.night["20:05"], at("20:05"));
  });
});
