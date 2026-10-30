// Tests for check.js. Each test builds a small world with world(html, rulesFn) and looks at what
// Check.run() says about it; the fixture world comes back afterwards.

// The fixture world, read again the way run-node.js first read it: tests/fixtures/rules.js and
// tests/fixtures/index.html.
function readFixture() {
  Toolbox.reset();
  fixtureRules();
  Loader.read(minidom(FIXTURE_HTML).body);
}

// Checks a world made of html (its index.html) and what rulesFn writes (its rules.js; Toolbox's
// defaults if there's none), then puts the fixture world back. Gives Check.run()'s answer.
function world(html, rulesFn) {
  Toolbox.reset();
  try {
    if (rulesFn) rulesFn();
    Loader.read(minidom(html).body);
    return Check.run();
  } finally {
    readFixture();
  }
}

function mentions(list, parts) {
  return list.some(function (m) {
    return parts.every(function (p) { return m.indexOf(p) >= 0; });
  });
}

function startInA() { startAt("19:00", "a"); }

test("check: clean fixture has no errors or warnings", function () {
  var r = Check.run();
  eq(r.errors, [], "errors");
  eq(r.warnings, [], "warnings");
});

test("check: unknown exit", function () {
  var r = world('<section class="room" id="a" title="Hub"><nav><a href="#zz">Nowhere</a></nav></section>', startInA);
  ok(mentions(r.errors, ["index.html", '"a"', '"zz"']), r.errors.join("|"));
});

test("check: unknown goTo", function () {
  var r = world('<section class="room" id="b" title="Room B"><a id="door" href="#nowhere" title="Door">In you go.</a></section>');
  ok(mentions(r.errors, ["index.html", "door", "nowhere"]), r.errors.join("|"));
});

test("check: a button with nothing drawn for it is fine (the view gives it the plain look)", function () {
  // room c's drawing has no part called "vase"
  var r = world('<section class="room" id="c" title="Room C"><button id="vase" title="Vase">A vase.</button></section>',
    function () { startAt("19:00", "c"); });
  eq(r.errors, []);
  eq(r.warnings, []);
});

test("check: room without a drawing", function () {
  var r = world('<section class="room" id="attic" title="Attic"></section>');
  ok(mentions(r.errors, ["engine/drawings/attic.js"]), r.errors.join("|"));
});

test("check: a room without a drawing is fine when the plain one is there", function () {
  // In a page, loader.js always adds engine/drawings/plain.js; the fixture has none of its own.
  ROOMS.plain = '<svg viewBox="0 0 1600 900"><rect width="1600" height="900"/></svg>';
  try {
    var r = world('<section class="room" id="attic" title="Attic"></section>', function () { startAt("19:00", "attic"); });
    eq(r.errors, []);
    eq(r.warnings, []);
  } finally { delete ROOMS.plain; }
});

test("check: title drawing is required", function () {
  // The drawings aren't part of a world (they're engine/drawings/*.js), so this one goes away by hand.
  var old = ROOMS.title;
  try {
    delete ROOMS.title;
    var r = Check.run();
    ok(mentions(r.errors, ["engine/drawings/title.js"]), r.errors.join("|"));
  } finally { ROOMS.title = old; }
});

test("check: unknown ending ids", function () {
  var r = world('<section class="room" id="c" title="Room C"><button id="trap" title="Trap" data-ending="NOPE1"></button></section>', function () {
    startAt("19:00", "c");
    when("20:20", function () {
      danger({ clicks: 4, safe: beIn("c"), ending: "NOPE3", deadly: click("trap", { ending: "NOPE2" }),
        thenWait: { steps: ["1"], ending: "NOPE4" } });
    });
    when("21:00", function () { endGame("NOPE5"); });
  });
  ok(mentions(r.errors, ["NOPE1"]), "hotspot");
  ok(mentions(r.errors, ["NOPE2"]), "fatal");
  ok(mentions(r.errors, ["NOPE3"]), "late");
  ok(mentions(r.errors, ["NOPE4"]), "hold");
  ok(mentions(r.errors, ["NOPE5"]), "event");
});

test("check: bad time format and out-of-order events", function () {
  var r = world(FIXTURE_HTML, function () {
    startAt("9:3", "a");
    when("7:5", function () {});
  });
  ok(mentions(r.errors, ["rules.js", '"7:5"']), r.errors.join("|"));
  ok(mentions(r.errors, ["startAt", "9:3"]), r.errors.join("|"));
  // Rules sort themselves by time, so one written above an earlier one is fine.
  r = world(FIXTURE_HTML, function () {
    startInA();
    when("19:20", function () {});
    when("19:10", function () {});
  });
  eq(r.errors, [], "rules in any order");
});

test("check: hotspot note that does not exist", function () {
  var r = world('<section class="room" id="b" title="Room B"><button id="note" title="Note" data-note="ghostnote"></button></section>');
  ok(mentions(r.errors, ["ghostnote"]), r.errors.join("|"));
});

test("check: fake note signed Love you gives a warning", function () {
  var r = world('<article class="note fake" id="fake"><p>Let us in.</p><p>Love you!</p></article>');
  ok(mentions(r.warnings, ["fake", "Love you"]), r.warnings.join("|"));
});

test("check: real note without Love you gives a warning", function () {
  var r = world('<article class="note" id="n1"><h2>Rules</h2><ol><li>Rule one.</li></ol></article>');
  ok(mentions(r.warnings, ["n1", "Love you"]), r.warnings.join("|"));
});

test("check: danger steps and deadly clicks find hotspots by name", function () {
  var r = world('<section class="room" id="c" title="Room C"><button id="lamp" class="light" title="Lamp">Click.</button></section>' +
    '<section class="ending" id="X1"><h1>X1</h1>Ending one.</section>', function () {
    startAt("19:00", "c");
    when("20:20", function () { danger({ clicks: 4, safe: beIn("c"), ending: "X1", deadly: click("light") }); });
    when("20:50", function () { danger({ clicks: 7, safe: click("light"), ending: "X1" }); }); // the lamp's class
  });
  eq(r.errors, [], "errors");
  eq(r.warnings, [], "warnings");
});

test("check: shortest counts nav, goTo and clicks", function () {
  eq(Check.shortest("a", [{ room: "b" }, { room: "closet" }]), 2);
  eq(Check.shortest("c", [{ room: "c", hotspot: "kid" }, { room: ["b", "closet"] }]), 3);
  eq(Check.shortest("c", [{ leave: "c" }]), 1);
  eq(Check.shortest("a", [{ leave: "c" }]), 0);
  eq(Check.shortest("a", [{ room: "feed" }]), Infinity);
});

test("check: deadline too short gives a warning naming the event and the numbers", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:20", function () { danger({ clicks: 2, safe: [beIn("b"), beIn("closet")], ending: "X2" }); });
  });
  ok(mentions(r.warnings, ['"20:20"', "deadline of 2", "takes 3"]), r.warnings.join("|"));
});

test("check: two events with the same id", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("19:20", function () {});
    when("19:20", function () {});    // this one is "19:20 #2"
    when("19:20 #2", function () {}); // a time that is really that id
  });
  ok(mentions(r.errors, ['"19:20 #2"', "twice"]), r.errors.join("|"));
});

test("check: unknown trigger", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:00", { trigger: "inroom", room: "c" }, function () {});
  });
  ok(mentions(r.errors, ['"20:00"', "inroom"]), r.errors.join("|"));
});

test("check: a danger step clicks a hotspot its room doesn't have", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:50", function () { danger({ clicks: 7, safe: [click("kidd"), beIn(["b", "closet"])], ending: "X2" }); });
  });
  ok(mentions(r.errors, ['"20:50"', "kidd"]), r.errors.join("|"));
});

test("check: an event group no drawing has", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("19:50", enteringRoomWith("ghostt"), notIn("closet"), function () { show("ghost"); });
  });
  ok(mentions(r.warnings, ['"19:50"', "ghostt"]), r.warnings.join("|"));
});

test("check: a fatal hotspot that doesn't exist", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:20", function () {
      danger({ clicks: 4, safe: [beIn("b"), beIn("closet")], ending: "X2", deadly: click("trapp", { ending: "X1" }) });
    });
  });
  ok(mentions(r.warnings, ['"20:20"', "trapp"]), r.warnings.join("|"));
});

test("check: after names an event that doesn't exist", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("19:30", afterRule("19:55"), function () { show("lateOn"); });
  });
  ok(mentions(r.errors, ['"19:30"', "19:55"]), r.errors.join("|"));
});

test("check: shortest finds a click with no room wherever that button is", function () {
  eq(Check.shortest("a", [{ hotspot: "kid" }]), 2);
  eq(Check.shortest("a", [{ hotspot: "light" }]), 2, "by class");
  eq(Check.shortest("a", [{ hotspot: "door" }, { room: "closet" }]), 2, "the door takes you into the closet");
  eq(Check.shortest("a", [{ hotspot: "nothing" }]), Infinity);
});

test("check: a rule's danger is checked from a pretend run", function () {
  var before = JSON.stringify(Game.state);
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("21:00", function () {
      show("x");
      danger({ clicks: 1, safe: click("kid"), ending: "NOPE6", deadly: click("trap", { ending: "NOPE7" }),
        thenWait: { steps: ["1"], ending: "NOPE8" } });
    });
  });
  ok(mentions(r.errors, ["rules.js", '"21:00"', "NOPE6"]), "late: " + r.errors.join("|"));
  ok(mentions(r.errors, ["NOPE7"]), "deadly: " + r.errors.join("|"));
  ok(mentions(r.errors, ["NOPE8"]), "the wait: " + r.errors.join("|"));
  ok(mentions(r.warnings, ['"21:00"', "deadline of 1", "at least 5"]), r.warnings.join("|"));
  eq(JSON.stringify(Game.state), before, "the pretend run changed nothing");
});

test("check: a rule's ending and the buttons its steps click are checked", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("21:00", function () { endGame("NOPE9"); });
    when("21:00", function () { danger({ clicks: 9, safe: click("kidd"), ending: "X2" }); });
  });
  ok(mentions(r.errors, ['"21:00"', "NOPE9"]), r.errors.join("|"));
  ok(mentions(r.errors, ['"21:00 #2"', "kidd"]), r.errors.join("|"));
});
