// Tests for check.js. Each test breaks one thing in the fixture world, then puts it back.
function checked(fn) {
  var r = Check.run();
  fn(r);
}

function mentions(list, parts) {
  return list.some(function (m) {
    return parts.every(function (p) { return m.indexOf(p) >= 0; });
  });
}

test("check: clean fixture has no errors or warnings", function () {
  var r = Check.run();
  eq(r.errors, [], "errors");
  eq(r.warnings, [], "warnings");
});

test("check: unknown exit", function () {
  var old = ROOM_INFO.a.exits;
  try {
    ROOM_INFO.a.exits = ["zz"];
    checked(function (r) { ok(mentions(r.errors, ["story.js", '"a"', '"zz"']), r.errors.join("|")); });
  } finally { ROOM_INFO.a.exits = old; }
});

test("check: unknown goTo", function () {
  var old = ROOM_INFO.b.hotspots.door.goTo;
  try {
    ROOM_INFO.b.hotspots.door.goTo = "nowhere";
    checked(function (r) { ok(mentions(r.errors, ["story.js", "door", "nowhere"]), r.errors.join("|")); });
  } finally { ROOM_INFO.b.hotspots.door.goTo = old; }
});

test("check: story hotspot missing from SVG", function () {
  var old = ROOMS.c;
  try {
    ROOMS.c = old.replace('data-hotspot="lamp"', 'data-x="lamp"');
    checked(function (r) { ok(mentions(r.errors, ["rooms/c.js", "lamp"]), r.errors.join("|")); });
  } finally { ROOMS.c = old; }
});

test("check: room without a drawing", function () {
  var old = ROOMS.b;
  try {
    delete ROOMS.b;
    checked(function (r) { ok(mentions(r.errors, ["rooms/b.js"]), r.errors.join("|")); });
  } finally { ROOMS.b = old; }
});

test("check: title drawing is required", function () {
  var old = ROOMS.title;
  try {
    delete ROOMS.title;
    checked(function (r) { ok(mentions(r.errors, ["rooms/title.js"]), r.errors.join("|")); });
  } finally { ROOMS.title = old; }
});

test("check: unknown ending ids", function () {
  var h = ROOM_INFO.c.hotspots.trap;
  var hide = EVENTS.filter(function (e) { return e.id === "hide"; })[0];
  var home = EVENTS.filter(function (e) { return e.id === "home"; })[0];
  var saved = [h.ending, hide.danger.fatal[0].ending, hide.danger.late, hide.danger.hold.fatal, home.ending];
  try {
    h.ending = "NOPE1";
    checked(function (r) { ok(mentions(r.errors, ["NOPE1"]), "hotspot"); });
    h.ending = saved[0];
    hide.danger.fatal[0].ending = "NOPE2";
    checked(function (r) { ok(mentions(r.errors, ["NOPE2"]), "fatal"); });
    hide.danger.fatal[0].ending = saved[1];
    hide.danger.late = "NOPE3";
    checked(function (r) { ok(mentions(r.errors, ["NOPE3"]), "late"); });
    hide.danger.late = saved[2];
    hide.danger.hold.fatal = "NOPE4";
    checked(function (r) { ok(mentions(r.errors, ["NOPE4"]), "hold"); });
    hide.danger.hold.fatal = saved[3];
    home.ending = "NOPE5";
    checked(function (r) { ok(mentions(r.errors, ["NOPE5"]), "event"); });
  } finally {
    h.ending = saved[0];
    hide.danger.fatal[0].ending = saved[1];
    hide.danger.late = saved[2];
    hide.danger.hold.fatal = saved[3];
    home.ending = saved[4];
  }
});

test("check: bad time format and out-of-order events", function () {
  var e1 = EVENTS[0];
  var old = e1.time;
  var oldNb = ROOM_INFO.c.hotspots.kid.notBefore;
  try {
    e1.time = "7:5";
    checked(function (r) { ok(mentions(r.errors, ["e1", "7:5"]), r.errors.join("|")); });
    e1.time = old;
    EVENTS[1].time = "19:10";
    checked(function (r) { ok(mentions(r.errors, ["e2", "19:10", "e1", "up"]), r.errors.join("|")); });
    EVENTS[1].time = "19:20";
    ROOM_INFO.c.hotspots.kid.notBefore = "9:3";
    checked(function (r) { ok(mentions(r.errors, ["kid", "9:3"]), r.errors.join("|")); });
  } finally {
    e1.time = old;
    EVENTS[1].time = "19:20";
    ROOM_INFO.c.hotspots.kid.notBefore = oldNb;
  }
});

test("check: hotspot note that does not exist", function () {
  var old = ROOM_INFO.b.hotspots.note.note;
  try {
    ROOM_INFO.b.hotspots.note.note = "ghostnote";
    checked(function (r) { ok(mentions(r.errors, ["ghostnote"]), r.errors.join("|")); });
  } finally { ROOM_INFO.b.hotspots.note.note = old; }
});

test("check: fake note signed Love you gives a warning", function () {
  var old = NOTES.fake.text;
  try {
    NOTES.fake.text = old + " Love you!";
    checked(function (r) { ok(mentions(r.warnings, ["fake", "Love you"]), r.warnings.join("|")); });
  } finally { NOTES.fake.text = old; }
});

test("check: real note without Love you gives a warning", function () {
  var old = NOTES.n1.text;
  try {
    NOTES.n1.text = "Rule one.";
    checked(function (r) { ok(mentions(r.warnings, ["n1", "Love you"]), r.warnings.join("|")); });
  } finally { NOTES.n1.text = old; }
});

test("check: shortest counts nav, goTo and clicks", function () {
  eq(Check.shortest("a", [{ room: "b" }, { room: "closet" }]), 2);
  eq(Check.shortest("c", [{ room: "c", hotspot: "kid" }, { room: ["b", "closet"] }]), 3);
  eq(Check.shortest("c", [{ leave: "c" }]), 1);
  eq(Check.shortest("a", [{ leave: "c" }]), 0);
  eq(Check.shortest("a", [{ room: "feed" }]), Infinity);
});

test("check: deadline too short gives a warning naming the event and the numbers", function () {
  var hide = EVENTS.filter(function (e) { return e.id === "hide"; })[0];
  var old = hide.danger.deadline;
  try {
    hide.danger.deadline = 2;
    checked(function (r) { ok(mentions(r.warnings, ["hide", "2", "3"]), r.warnings.join("|")); });
  } finally { hide.danger.deadline = old; }
});

function eventById(id) {
  return EVENTS.filter(function (e) { return e.id === id; })[0];
}

test("check: two events with the same id", function () {
  var ev = eventById("e2");
  try {
    ev.id = "e1";
    checked(function (r) { ok(mentions(r.errors, ["e1", "twice"]), r.errors.join("|")); });
  } finally { ev.id = "e2"; }
});

test("check: unknown trigger", function () {
  var ev = eventById("glass");
  try {
    ev.trigger = "inroom";
    checked(function (r) { ok(mentions(r.errors, ["glass", "inroom"]), r.errors.join("|")); });
  } finally { ev.trigger = "inRoom"; }
});

test("check: a danger step clicks a hotspot its room doesn't have", function () {
  var step = eventById("pick").danger.steps[0];
  try {
    step.hotspot = "kidd";
    checked(function (r) { ok(mentions(r.errors, ["pick", "kidd"]), r.errors.join("|")); });
  } finally { step.hotspot = "kid"; }
});

test("check: an event group no drawing has", function () {
  var ev = eventById("ghost");
  try {
    ev.group = "ghostt";
    checked(function (r) { ok(mentions(r.warnings, ["ghost", "ghostt"]), r.warnings.join("|")); });
  } finally { ev.group = "ghost"; }
});

test("check: a fatal hotspot that doesn't exist", function () {
  var f = eventById("hide").danger.fatal[0];
  try {
    f.hotspot = "trapp";
    checked(function (r) { ok(mentions(r.warnings, ["hide", "trapp"]), r.warnings.join("|")); });
  } finally { f.hotspot = "trap"; }
});

test("check: after names an event that doesn't exist", function () {
  var ev = eventById("late");
  try {
    ev.after = "ghostt";
    checked(function (r) { ok(mentions(r.errors, ["late", "ghostt"]), r.errors.join("|")); });
  } finally { ev.after = "ghost"; }
});
