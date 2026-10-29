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
    checked(function (r) { ok(mentions(r.errors, ["e2", "19:10"]), r.errors.join("|")); });
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

test("check: fake note naming the cat or sister gives a warning", function () {
  var old = NOTES.fake.text;
  try {
    NOTES.fake.text = old + " " + CAT_NAME;
    checked(function (r) { ok(mentions(r.warnings, ["fake", CAT_NAME]), r.warnings.join("|")); });
    NOTES.fake.text = old + " " + SISTER_NAME;
    checked(function (r) { ok(mentions(r.warnings, ["fake", SISTER_NAME]), r.warnings.join("|")); });
  } finally { NOTES.fake.text = old; }
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
