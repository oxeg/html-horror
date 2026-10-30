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

// The good ending (a world without one gets a warning), and a room to start in.
var WIN = '<section class="ending win" id="home"><h1>Home</h1>You made it.</section>';
var HUB = '<section class="room" id="a" title="Hub"><button id="rug" title="Rug">A rug.</button></section>';

test("check: clean fixture has no errors or warnings", function () {
  var r = Check.run();
  eq(r.errors, [], "errors");
  eq(r.warnings, [], "warnings");
});

// ---- the shape of index.html ----

test("check: two things with the same id", function () {
  var r = world(HUB + '<section class="room" id="lamp" title="Lamp room"><button id="lamp" title="Lamp">On.</button></section>' + WIN, startInA);
  ok(mentions(r.errors, ["index.html", "same id", '"lamp"', "Scratch"]), r.errors.join("|"));
});

test("check: an id that is also a JS word is just an id", function () {
  var r = world('<section class="room" id="a" title="Hub"><button id="constructor" title="Builder">Hammer.</button></section>' + WIN, startInA);
  eq(r.errors, []);
  eq(r.warnings, []);
});

test("check: a button with no title", function () {
  var r = world('<section class="room" id="a" title="Hub"><button id="vase">A vase.</button></section>' + WIN, startInA);
  ok(mentions(r.errors, ["index.html", '"vase"', "no title", 'title="']), r.errors.join("|"));
});

test("check: a room with no title, and a room with no id", function () {
  var r = world('<section class="room" id="a"><button id="rug" title="Rug">A rug.</button></section>' +
    '<section class="room" title="Attic"></section>' + WIN, startInA);
  ok(mentions(r.errors, ["index.html", 'room "a"', "no title"]), r.errors.join("|"));
  ok(mentions(r.errors, ["index.html", "room", "no id", "Attic"]), r.errors.join("|"));
  ok(!mentions(r.errors.concat(r.warnings), ["null"]), "nothing trips on the room with no id: " + r.errors.concat(r.warnings).join("|"));
});

test("check: a button with no id is caught before anything trips on it", function () {
  var r = world('<section class="room" id="a" title="Hub"><button title="Vase" hidden>A vase.</button>' +
    '<button id="rug" title="Rug">A rug.</button></section>' + WIN, function () {
    startInA();
    whenClicked("rugg", function () {});
    when("19:30", function () { show("vase"); });
  });
  ok(mentions(r.errors, ["index.html", 'room "a"', "no id", "Vase", 'like id="vase"']), r.errors.join("|"));
  ok(!mentions(r.errors.concat(r.warnings), ["null"]), "no message names null: " + r.errors.concat(r.warnings).join("|"));
});

test("check: a section inside a section, and a note inside a note", function () {
  var r = world('<section class="room" id="a" title="Hub"><button id="rug" title="Rug">A rug.</button>' +
    '<section class="room" id="b" title="Room B"><nav>Go to: <a href="#a">Hub</a></nav></section></section>' + WIN, startInA);
  ok(mentions(r.errors, ["index.html", 'room "b"', 'room "a"', "Did you forget </section>"]), r.errors.join("|"));
  r = world(HUB + '<article class="note" id="n1"><h2>Rules</h2><p>Love you!</p>' +
    '<article class="note fake" id="n2"><p>Let us in.</p></article></article>' + WIN, startInA);
  ok(mentions(r.errors, ["index.html", 'note "n2"', 'note "n1"', "Did you forget </article>"]), r.errors.join("|"));
});

test("check: a button outside every room", function () {
  var r = world(HUB + '<button id="loose" title="Loose">Hi.</button>' + WIN, startInA);
  ok(mentions(r.errors, ["index.html", '"loose"', "isn't inside any room"]), r.errors.join("|"));
});

// ---- what index.html points at ----

test("check: a link to a room that isn't there", function () {
  var r = world('<section class="room" id="a" title="Hub"><nav><a href="#bb">Room B</a></nav></section>' +
    '<section class="room" id="b" title="Room B"></section>' + WIN, startInA);
  ok(mentions(r.errors, ["index.html", 'room "a"', "#bb", "did you mean b?"]), r.errors.join("|"));
});

test("check: a door to a room that isn't there", function () {
  var r = world('<section class="room" id="b" title="Room B"><a id="door" href="#nowhere" title="Door">In you go.</a></section>');
  ok(mentions(r.errors, ["index.html", "door", "nowhere"]), r.errors.join("|"));
});

test("check: data-note, data-ending and data-camera naming nothing", function () {
  var r = world('<section class="room" id="a" title="Hub">' +
    '<button id="paper" title="Paper" data-note="ghostnote"></button>' +
    '<button id="trap" title="Trap" data-ending="hom"></button>' +
    '<button id="screen" title="Screen" data-camera="fed"></button>' +
    '<button id="tv" title="TV" data-camera="b"></button></section>' +
    '<section class="room" id="b" title="Room B"></section>' +
    '<section class="room camera" id="feed" title="Feed"></section>' + WIN, startInA);
  ok(mentions(r.errors, ["index.html", '"paper"', 'data-note="ghostnote"']), r.errors.join("|"));
  ok(mentions(r.errors, ["index.html", '"trap"', 'data-ending="hom"', "did you mean home?"]), r.errors.join("|"));
  ok(mentions(r.errors, ["index.html", '"screen"', 'data-camera="fed"', "did you mean feed?"]), r.errors.join("|"));
  ok(mentions(r.errors, ["index.html", '"tv"', 'data-camera="b"', '<section class="room camera" id="b">']), "a room that isn't a camera: " + r.errors.join("|"));
});

test("check: hotspot note that does not exist", function () {
  var r = world('<section class="room" id="b" title="Room B"><button id="note" title="Note" data-note="ghostnote"></button></section>');
  ok(mentions(r.errors, ["ghostnote"]), r.errors.join("|"));
});

test("check: no ending with class win gives a warning", function () {
  var r = world(HUB + '<section class="ending" id="lost"><h1>Lost</h1>Oh no.</section>', startInA);
  eq(r.errors, []);
  ok(mentions(r.warnings, ["index.html", 'class="win"']), r.warnings.join("|"));
});

test("check: fake note signed Love you gives a warning", function () {
  var r = world('<article class="note fake" id="fake"><p>Let us in.</p><p>Love you!</p></article>');
  ok(mentions(r.warnings, ["fake", "Love you"]), r.warnings.join("|"));
});

test("check: real note without Love you gives a warning", function () {
  var r = world('<article class="note" id="n1"><h2>Rules</h2><ol><li>Rule one.</li></ol></article>');
  ok(mentions(r.warnings, ["n1", "Love you"]), r.warnings.join("|"));
});

test("check: a button with nothing drawn for it is fine (the view gives it the plain look)", function () {
  // room c's drawing has no part called "vase"
  var r = world('<section class="room" id="c" title="Room C"><button id="vase" title="Vase">A vase.</button></section>' + WIN,
    function () { startAt("19:00", "c"); });
  eq(r.errors, []);
  eq(r.warnings, []);
});

test("check: a room without a drawing is fine: it gets the plain room", function () {
  // In a page, loader.js always adds engine/drawings/plain.js; here there's none, and no drawing for the attic.
  var r = world('<section class="room" id="attic" title="Attic"></section>' + WIN, function () { startAt("19:00", "attic"); });
  eq(r.errors, []);
  eq(r.warnings, []);
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

// ---- rules.js, when its rules register ----

test("check: whenClicked names a button that isn't there", function () {
  var r = world('<section class="room" id="a" title="Hub"><button id="fridge" title="Fridge">Cold.</button></section>' + WIN, function () {
    startInA();
    whenClicked("fridg", function () { say("Milk."); });
  });
  ok(mentions(r.errors, ["rules.js (line ", 'whenClicked("fridg")', "did you mean", "fridge", "line"]), r.errors.join("|"));
});

test("check: two whenClicked scripts for the same button: only the last one runs", function () {
  var lines = [];  // the line each whenClicked is on
  var r = world(FIXTURE_HTML, function () {
    startInA();
    whenClicked("lamp", function () { say("One."); }); lines.push(Toolbox.lineOf(new Error().stack));
    whenClicked("lamp", function () { say("Two."); }); lines.push(Toolbox.lineOf(new Error().stack));
  });
  eq(r.errors, []);
  ok(mentions(r.warnings, ['rules.js: there are two whenClicked("lamp") scripts (line ' + lines[0] + " and line " + lines[1] + "); only the last one runs."]), r.warnings.join("|"));
});

test("check: danger() in a whenClicked script does nothing", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    whenClicked("lamp", function () {
      say("Run!");
      danger({ clicks: 3, safe: beIn("b"), ending: "X1" });
    });
  });
  eq(r.errors, []);
  ok(mentions(r.warnings, ["rules.js (line ", 'whenClicked("lamp"): danger() only works in a when() rule']), r.warnings.join("|"));
});

test("check: when() and whenClicked() need a function at the end", function () {
  var r = world(HUB + WIN, function () {
    startInA();
    when("21:00");
    when("21:10", inRoom("a"));
    whenClicked("rug");
  });
  ok(mentions(r.errors, ["rules.js (line ", 'when("21:00", …) needs a function at the end']), r.errors.join("|"));
  ok(mentions(r.errors, ["rules.js (line ", 'when("21:10", …) needs a function at the end']), r.errors.join("|"));
  ok(mentions(r.errors, ["rules.js (line ", 'whenClicked("rug", …) needs a function at the end']), r.errors.join("|"));
  ok(!mentions(r.errors.concat(r.warnings), ["check.js"]) && !mentions(r.warnings, ["stops halfway"]), "nothing else trips on it: " + r.errors.concat(r.warnings).join("|"));
});

test("check: bad time format, and rules in any order", function () {
  var r = world(FIXTURE_HTML, function () {
    startAt("9:3", "a");
    when("7:5", function () {});
  });
  ok(mentions(r.errors, ["rules.js (line ", 'when("7:5"', "19:05"]), r.errors.join("|"));
  ok(mentions(r.errors, ["startAt", "9:3"]), r.errors.join("|"));
  // Rules sort themselves by time, so one written above an earlier one is fine.
  r = world(FIXTURE_HTML, function () {
    startInA();
    when("19:20", function () {});
    when("19:10", function () {});
  });
  eq(r.errors, [], "rules in any order");
});

test("check: a rule's id is made from its time, so only a bad time can look like a second id", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("19:20", function () {});
    when("19:20", function () {});    // this one is "19:20 #2"
    when("19:20 #2", function () {}); // not a time
  });
  ok(mentions(r.errors, ['when("19:20 #2"', "19:05"]), r.errors.join("|"));
  ok(!mentions(r.errors, ["twice"]), r.errors.join("|"));
});

test("check: between() needs two times, the earlier one first", function () {
  var r = world(HUB + WIN, function () {
    startInA();
    when(between("22:40", "21:30"), function () {});
    when(between("21:00"), function () {});
    when(between("21:5", "22:00"), function () {});
    when(between("21:10", "21:50"), function () {});
  });
  ok(mentions(r.errors, ["rules.js (line ", 'between("22:40", "21:30"): the first time has to be the earlier one']), r.errors.join("|"));
  ok(mentions(r.errors, ["rules.js (line ", 'between("21:00", …) needs two times, like between("21:00", "22:00")']), r.errors.join("|"));
  ok(mentions(r.errors, ["rules.js (line ", 'between("21:5", "22:00"): the time "21:5"', "19:05"]), r.errors.join("|"));
  eq(r.errors.length, 3, "the good one is fine: " + r.errors.join("|"));
});

test("check: onSomeNights() needs two whole numbers, the first one no bigger", function () {
  var r = world(HUB + WIN, function () {
    startInA();
    when("21:00", onSomeNights(11, 10), function () {});
    when("21:10", onSomeNights(1.5, 3), function () {});
    when("21:20", onSomeNights(3), function () {});
    when("21:30", onSomeNights(0, 4), function () {});   // never: a way to switch a rule off
    when("21:40", onSomeNights(4, 4), function () {});
  });
  var says = "two whole numbers, the first one no bigger: onSomeNights(9, 10) means 9 nights out of 10";
  ok(mentions(r.errors, ["rules.js (line ", "onSomeNights(11, 10) needs " + says]), r.errors.join("|"));
  ok(mentions(r.errors, ["rules.js (line ", "onSomeNights(1.5, 3) needs"]), r.errors.join("|"));
  ok(mentions(r.errors, ["rules.js (line ", "onSomeNights(3, …) needs"]), r.errors.join("|"));
  eq(r.errors.length, 3, "the good ones are fine: " + r.errors.join("|"));
});

test("check: afterRule names a time with no rule", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("19:50", function () {});
    when("19:30", afterRule("19:55"), function () { show("lateOn"); });
  });
  ok(mentions(r.errors, ["rules.js (line ", 'afterRule("19:55")', "no rule at 19:55", "did you mean 19:50?"]), r.errors.join("|"));
});

test("check: afterRule names a time with two rules", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("19:20", function () {});
    when("19:20", function () {});
    when("19:30", afterRule("19:20"), function () {});
  });
  ok(mentions(r.errors, ["rules.js (line ", 'afterRule("19:20")', "2 rules at 19:20"]), r.errors.join("|"));
});

test("check: two triggers in one when()", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("21:00", inRoom("c"), lightFinds("face", 3), function () {});
  });
  ok(mentions(r.errors, ["rules.js (line ", 'when("21:00", …)', "inRoom", "lightFinds", "only one"]), r.errors.join("|"));
});

test("check: unknown trigger", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:00", { trigger: "inroom", room: "c" }, function () {});
  });
  ok(mentions(r.errors, ['"20:00"', "inroom"]), r.errors.join("|"));
});

test("check: inRoom and notIn name rooms that aren't there", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:00", inRoom("closit"), function () {});
    when("20:10", notIn("bb"), function () {});
  });
  ok(mentions(r.errors, ["rules.js (line ", 'inRoom("closit")', "did you mean closet?"]), r.errors.join("|"));
  ok(mentions(r.errors, ["rules.js (line ", 'notIn("bb")', "did you mean b?"]), r.errors.join("|"));
});

test("check: an event group nothing has", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("19:50", enteringRoomWith("ghostt"), notIn("closet"), function () { show("ghost"); });
  });
  ok(mentions(r.errors, ["rules.js (line ", 'enteringRoomWith("ghostt")', "did you mean ghost?"]), r.errors.join("|"));
});

// ---- rules.js, read without running it (all warnings) ----

test("check: show() names something that isn't there", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("19:30", function () { show("ghots"); });
  });
  eq(r.errors, []);
  ok(mentions(r.warnings, ["rules.js (line ", 'show("ghots")', "did you mean ghost?"]), r.warnings.join("|"));
});

test("check: playSound, hide, isShown and endGame name things that aren't there", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    whenClicked("lamp", function () {
      playSound("clik");
      hide("lampp");
      if (isShown("rugg")) say("Hm.");
      if (youAreIn("zz")) endGame("WON");  // a click script doesn't run before the game: only reading it finds this
    });
  });
  ok(mentions(r.warnings, ['playSound("clik")', "did you mean click?"]), r.warnings.join("|"));
  ok(mentions(r.warnings, ['hide("lampp")', "did you mean lamp?"]), r.warnings.join("|"));
  ok(mentions(r.warnings, ['isShown("rugg")', "did you mean rug?"]), r.warnings.join("|"));
  eq(r.errors.length, 1, "an ending that isn't there stops the game: " + r.errors.join("|"));
  ok(mentions(r.errors, ['endGame("WON")', "did you mean WIN?"]), r.errors.join("|"));
});

test("check: an unknown ending in a click script is an error, worded as for a when() rule", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    whenClicked("lamp", function () { endGame("homee"); });
    when("19:30", function () { endGame("homee"); });
  });
  var said = r.errors.filter(function (m) { return m.indexOf('endGame("homee"): there is no ending "homee" in index.html') >= 0; });
  eq(said.length, 2, "the click script and the rule: " + r.errors.join("|"));
  ok(!mentions(r.warnings, ["homee"]), "not a warning too: " + r.warnings.join("|"));
});

test("check: a word that isn't a block gives a warning, once", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("19:30", function () { sya("hi"); });
  });
  eq(r.errors, []);
  ok(mentions(r.warnings, ["rules.js (line ", "sya", "say"]), r.warnings.join("|"));
  eq(r.warnings.filter(function (m) { return m.indexOf("sya") >= 0; }).length, 1, "one message: " + r.warnings.join("|"));
});

test("check: a hidden button no rule ever shows", function () {
  var html = '<section class="room" id="a" title="Hub"><button id="rug" title="Rug">A rug.</button>' +
    '<button id="box" class="crate" title="Box" hidden>A box.</button></section>' + WIN;
  var r = world(html, startInA);
  eq(r.errors, []);
  ok(mentions(r.warnings, ["index.html", '"box"', "starts hidden", 'show("box")']), r.warnings.join("|"));
  function quiet(rules) {
    var w = world(html, function () { startInA(); rules(); }).warnings;
    ok(!mentions(w, ["starts hidden"]), w.join("|"));
  }
  quiet(function () { whenClicked("rug", function () { show("crate"); }); });  // by its class
  quiet(function () { when("19:30", function () { danger({ lasts: 1, whenSafe: { show: "box" } }); }); });
  quiet(function () { when("19:30", lightFinds("box", 2), function () {}); });
});

// Her own blocks (functions at the top of rules.js), for the tests below: the reading follows them.
function revealTheBox() { show("crate"); }
function hideTheGhots() { hide("ghots"); }
function pingA() { pingB(); }
function pingB() { pingA(); show("box"); }

test("check: a hidden button shown only from her own function is fine", function () {
  var html = '<section class="room" id="a" title="Hub"><button id="rug" title="Rug">A rug.</button>' +
    '<button id="box" class="crate" title="Box" hidden>A box.</button></section>' + WIN;
  var r = world(html, function () { startInA(); when("19:30", function () { revealTheBox(); }); });
  eq(r.warnings, []);
  r = world(html, function () { startInA(); whenClicked("rug", function () { pingA(); }); });  // they call each other: each is read once
  eq(r.warnings, []);
});

test("check: a name inside her own function is checked, and the message names the function", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    whenClicked("lamp", function () { hideTheGhots(); });
  });
  ok(mentions(r.warnings, ["rules.js (inside your function hideTheGhots())", 'hide("ghots")', "did you mean ghost?"]), r.warnings.join("|"));
});

test("check: a string joined with + isn't a name", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    whenClicked("lamp", function () {
      var where = "close";
      show("face-" + where);
      hide("gh" + "ost");
    });
  });
  ok(!mentions(r.warnings, ["no button or part of a drawing"]), r.warnings.join("|"));
});

// ---- dangers, from each rule's pretend run ----

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
  ok(mentions(r.errors, ["rules.js (line ", "the 20:20 danger", "NOPE2"]), "fatal");
  ok(mentions(r.errors, ["rules.js (line ", "the 20:20 danger", "NOPE3"]), "late");
  ok(mentions(r.errors, ["rules.js (line ", "the 20:20 danger", "NOPE4"]), "hold");
  ok(mentions(r.errors, ["rules.js (line ", 'endGame("NOPE5")']), "event");
  ok(!mentions(r.warnings, ["NOPE5"]), "the reading doesn't say it again: " + r.warnings.join("|"));
});

test("check: danger steps and deadly clicks find hotspots by name", function () {
  var r = world('<section class="room" id="c" title="Room C"><button id="lamp" class="light" title="Lamp">Click.</button></section>' +
    '<section class="ending" id="X1"><h1>X1</h1>Ending one.</section>' + WIN, function () {
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

test("check: too few clicks for a danger gives a warning in clicks", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:20", function () { danger({ clicks: 2, safe: [beIn("b"), beIn("closet")], ending: "X2" }); });
  });
  ok(mentions(r.warnings, ["rules.js (line ", "the 20:20 danger gives you 2 clicks", "takes 3", "clicks: 4"]), r.warnings.join("|"));
});

test("check: the 22:20 danger gives you 5 clicks but the shortest way takes 6", function () {
  var rooms = ["a", "b", "c", "d", "e", "f", "g"];
  var html = rooms.map(function (id, i) {
    var links = [rooms[i - 1], rooms[i + 1]].filter(Boolean).map(function (to) { return '<a href="#' + to + '">' + to + "</a>"; });
    return '<section class="room" id="' + id + '" title="Room ' + id + '"><nav>' + links.join(" ") + "</nav></section>";
  }).join("") + WIN;
  var r = world(html, function () {
    startInA();
    when("22:20", inRoom("a"), function () { danger({ clicks: 5, safe: beIn("g"), ending: "home" }); });
  });
  ok(mentions(r.warnings, ["22:20", "5 clicks", "6"]), r.warnings.join("|"));
});

test("check: a danger step clicks a hotspot its room doesn't have", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:50", function () { danger({ clicks: 7, safe: [click("kidd"), beIn(["b", "closet"])], ending: "X2" }); });
  });
  ok(mentions(r.errors, ["rules.js (line ", "the 20:50 danger", 'click("kidd")', "did you mean kid?"]), r.errors.join("|"));
});

test("check: a fatal hotspot that doesn't exist", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:20", function () {
      danger({ clicks: 4, safe: [beIn("b"), beIn("closet")], ending: "X2", deadly: click("trapp", { ending: "X1" }) });
    });
  });
  ok(mentions(r.warnings, ["rules.js (line ", "the 20:20 danger", 'click("trapp")', "did you mean trap?"]), r.warnings.join("|"));
});

test("check: a plain word where a danger needs a block", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:20", function () { danger({ clicks: 6, safe: "closet", ending: "X2" }); });
    when("20:30", function () { danger({ lasts: 2, deadly: "trap", ending: "X1" }); });
    when("20:40", function () { danger({ clicks: 6, safe: ["b", beIn("closet")], ending: "X2" }); });
  });
  ok(mentions(r.errors, ["rules.js (line ", "the 20:20 danger", 'safe: "closet"', 'did you mean beIn("closet")?']), r.errors.join("|"));
  ok(mentions(r.errors, ["rules.js (line ", "the 20:30 danger", 'deadly: "trap"', 'did you mean click("trap")?']), r.errors.join("|"));
  ok(mentions(r.errors, ["rules.js (line ", "the 20:40 danger", 'safe: "b"', 'did you mean beIn("b")?']), r.errors.join("|"));
});

test("check: a danger with neither safe nor lasts never ends", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:20", function () { danger({ clicks: 3, ending: "X1", deadly: click("trap") }); });
    when("20:30", function () { danger({}); });
  });
  ok(mentions(r.errors, ["rules.js (line ", "the 20:20 danger needs safe: … or lasts: …", "never ends"]), r.errors.join("|"));
  ok(mentions(r.errors, ["rules.js (line ", "the 20:30 danger needs safe: … or lasts: …"]), r.errors.join("|"));
});

test("check: a danger with clicks but no ending", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:20", function () { danger({ clicks: 6, safe: beIn("closet") }); });
  });
  ok(mentions(r.errors, ["rules.js (line ", "the 20:20 danger has clicks: 6 but no ending", 'ending: "…"']), r.errors.join("|"));
});

test("check: lasts together with safe or thenWait", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:20", function () { danger({ lasts: 3, safe: beIn("closet"), ending: "X1" }); });
    when("20:30", function () { danger({ lasts: 3, ending: "X1", thenWait: { steps: ["1"] } }); });
  });
  eq(r.errors, []);
  ok(mentions(r.warnings, ["rules.js (line ", "the 20:20 danger has lasts: and safe:", "over after 3 clicks", "safe: does nothing"]), r.warnings.join("|"));
  ok(mentions(r.warnings, ["rules.js (line ", "the 20:30 danger has lasts: and thenWait:", "thenWait: never happens"]), r.warnings.join("|"));
});

test("check: a deadly click with no ending anywhere", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:20", function () { danger({ lasts: 3, deadly: [click("trap"), anythingIn("c")] }); });
    when("20:30", function () { danger({ lasts: 3, deadly: click("lamp", { ending: "X1" }) }); });
  });
  eq(r.errors, []);
  ok(mentions(r.warnings, ["rules.js (line ", 'the 20:20 danger\'s deadly click("trap") has no ending', 'click("trap", { ending: "…" })']), r.warnings.join("|"));
  ok(mentions(r.warnings, ["rules.js (line ", 'the 20:20 danger\'s deadly anythingIn("c") has no ending', 'ending: "…"']), r.warnings.join("|"));
  ok(!mentions(r.warnings, ["20:30"]), "a deadly click with its own ending is fine: " + r.warnings.join("|"));
});

test("check: a danger shows or hides a name that isn't there", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("20:20", function () {
      danger({ clicks: 6, safe: beIn("closet"), ending: "X2", whenSafe: { hide: "ghots", sound: "knok" } });
    });
  });
  eq(r.errors, []);
  ok(mentions(r.warnings, ["rules.js (line ", "the 20:20 danger", '"ghots"', "did you mean ghost?"]), r.warnings.join("|"));
  ok(mentions(r.warnings, ["rules.js (line ", "the 20:20 danger", '"knok"', "did you mean knock?"]), r.warnings.join("|"));
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
  ok(mentions(r.errors, ["rules.js (line ", "21:00", "NOPE6"]), "late: " + r.errors.join("|"));
  ok(mentions(r.errors, ["NOPE7"]), "deadly: " + r.errors.join("|"));
  ok(mentions(r.errors, ["NOPE8"]), "the wait: " + r.errors.join("|"));
  ok(mentions(r.warnings, ["21:00", "gives you 1 click,", "clicks: 5"]), r.warnings.join("|"));
  r = world(FIXTURE_HTML, function () {
    startInA();
    when("21:00", inRoom("a"), function () { danger({ clicks: 2, safe: beIn("closet"), ending: "X2" }); });
  });
  ok(mentions(r.warnings, ["21:00", "gives you 2 clicks, and the shortest way takes all 2", "no click to spare", "clicks: 3"]), "just enough: " + r.warnings.join("|"));
  eq(JSON.stringify(Game.state), before, "the pretend run changed nothing");
});

test("check: a rule that stops halfway in its pretend run gives a warning with its line", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("21:00", function () { var lamp; lamp.turnOn(); });
  });
  eq(r.errors, []);
  ok(mentions(r.warnings, ["rules.js (line ", "the rule at 21:00 stops halfway", "turnOn"]), r.warnings.join("|"));
});

test("check: a rule's ending and the buttons its steps click are checked", function () {
  var r = world(FIXTURE_HTML, function () {
    startInA();
    when("21:00", function () { endGame("NOPE9"); });
    when("21:00", function () { danger({ clicks: 9, safe: click("kidd"), ending: "X2" }); });
  });
  ok(mentions(r.errors, ["rules.js (line ", "NOPE9"]), r.errors.join("|"));
  ok(mentions(r.errors, ["rules.js (line ", "21:00", "kidd"]), r.errors.join("|"));
});

test("check: shortest finds a click with no room wherever that button is", function () {
  eq(Check.shortest("a", [{ hotspot: "kid" }]), 2);
  eq(Check.shortest("a", [{ hotspot: "light" }]), 2, "by class");
  eq(Check.shortest("a", [{ hotspot: "door" }, { room: "closet" }]), 2, "the door takes you into the closet");
  eq(Check.shortest("a", [{ hotspot: "nothing" }]), Infinity);
});

// ---- the helpers ----

test("check: suggest finds a word 2 or fewer typing mistakes away", function () {
  eq(Check.suggest("fridg", ["sofa", "fridge", "fridge-note"]), "did you mean fridge?");
  eq(Check.suggest("sya", ["say", "show"]), "did you mean say?", "two letters swapped");
  eq(Check.suggest("Fridge", ["fridge"]), "did you mean fridge?", "capital letters matter");
  eq(Check.suggest("toaster", ["fridge", "sofa"]), "");
  eq(Check.suggest("x", ["a", "b"]), "", "a one-letter word is too short to guess");
  eq(Check.suggest("fridge", ["fridge"]), "", "a word that is right needs no guess");
});

test("check: scan finds the calls that aren't blocks, keywords, globals, her functions or methods", function () {
  var found = Check.scan(function () {
    if (isShown("lit")) sya("hi");      // a typo
    say("Don't count sya( in a string"); // only words outside quotes count
    // or sya( in a comment
    var list = [1, 2];
    list.push(Math.max(3, 4));           // method calls and globals
    function tidy() { hide("lit"); }     // her own function
    tidy();
    mystery(String(1));
  });
  eq(found, [{ name: "sya", line: 2 }, { name: "mystery", line: 9 }]);
});

test("check: scanNames finds the words in show, hide, isShown, playSound and endGame", function () {
  var names = Check.scanNames(function () {
    show("a", "b");
    hide(["c", "d"]);
    if (isShown("e") && youAreIn("not-a-name")) playSound("knock");
    say(`Not ${"f"}`);
    endGame("WIN");
    show("a");
  });
  eq(names, { show: ["a", "b"], hide: ["c", "d"], isShown: ["e"], playSound: ["knock"], endGame: ["WIN"] });
});

test("check: scanNames also reads her own functions, each once", function () {
  var names = Check.scanNames(function () {
    revealTheBox();
    hideTheGhots();
    revealTheBox();
  });
  eq(names.show, ["crate"]);
  eq(names.hide, ["ghots"]);
});

test("check: describe says what went wrong while playing", function () {
  eq(Check.describe({ file: "rules.js", line: 57, message: "sya is not defined" }), "rules.js line 57: sya is not defined. Did you mean say?");
  eq(Check.describe({ file: "rules.js", line: 3, message: "danger() can't hold a function." }), "rules.js line 3: danger() can't hold a function.");
});
