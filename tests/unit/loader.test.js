// The loader and minidom: reading rooms, notes and endings out of HTML.
var HTML = '<section class="room" id="den" title="Den"><nav>Go to: <a href="#hall">Hall</a></nav>' +
  '<button id="lamp" class="light" title="Lamp">Click.<br>  Click.</button>' +
  '<a id="hatch" href="#attic" title="Hatch" data-minutes="0">Up you go.</a>' +
  '<button id="ghost" title="Ghost?" data-ending="boo" hidden></button></section>' +
  '<article class="note fake" id="n"><h2>Hi &amp; bye</h2><p class="sign">Love you! ❤️</p></article>' +
  '<section class="ending win" id="boo" data-sound="sting"><h1>Boo</h1><p>"It\'s you."</p></section>';

test("loader reads a room, its exits and its buttons", function () {
  var w = Loader.build(minidom(HTML).body);
  eq(w.rooms.den.name, "Den"); eq(w.rooms.den.exits, ["hall"]);
  eq(w.rooms.den.hotspots.lamp, { label: "Lamp", text: "Click.<br> Click.", names: ["lamp", "light"], hidden: false });
  eq(w.rooms.den.hotspots.hatch.goTo, "attic"); eq(w.rooms.den.hotspots.hatch.minutes, 0);
  eq(w.rooms.den.hotspots.ghost.hidden, true); eq(w.rooms.den.hotspots.ghost.ending, "boo");
});

test("loader reads notes and endings", function () {
  var w = Loader.build(minidom(HTML).body);
  eq(w.notes.n.title, "Hi & bye"); eq(w.notes.n.fake, true);
  eq(w.endings.boo, { title: "Boo", text: '<p>"It\'s you."</p>', win: true, sound: "sting" });
});

test("minidom: comments, void tags, script and style are skipped, boolean attributes", function () {
  var body = minidom('<!DOCTYPE html><html><head><style>p > b { }</style></head><body>' +
    '<!-- <p id="no">hidden</p> --><script>var s = "<div id=x>";</script>' +
    '<p id=a class=\'x y\' hidden>one<br>two <img src="a.png"> &lt;3 &#65;&#x42;</p><input disabled></body></html>').body;
  eq(body.tagName, "BODY");
  eq(body.children.map(function (c) { return c.tagName; }), ["SCRIPT", "P", "INPUT"]);
  var p = body.children[1];
  eq(p.getAttribute("id"), "a"); eq(p.getAttribute("class"), "x y");
  eq(p.hasAttribute("hidden"), true); eq(p.getAttribute("hidden"), ""); eq(p.getAttribute("nope"), null);
  eq(p.children.map(function (c) { return c.tagName; }), ["BR", "IMG"]);
  eq(p.textContent, "onetwo  <3 AB");
  eq(p.innerHTML, 'one<br>two <img src="a.png"> &lt;3 &#65;&#x42;');
  eq(body.children[2].hasAttribute("disabled"), true);
  eq(minidom('<p title="a &amp; &quot;b&quot;">x</p>').body.children[0].getAttribute("title"), 'a & "b"');
});

test("loader lists every element with where it is", function () {
  var w = Loader.build(minidom(HTML).body);
  var den = w.elements.filter(function (e) { return e.id === "den"; })[0];
  eq(den, { tag: "section", id: "den", classes: ["room"], title: "Den", inside: [] });
  var lamp = w.elements.filter(function (e) { return e.id === "lamp"; })[0];
  eq(lamp, { tag: "button", id: "lamp", classes: ["light"], title: "Lamp", inside: ["den"] });
  var hall = w.elements.filter(function (e) { return e.tag === "a" && !e.id && e.inside.length; })[0];
  eq(hall.inside, ["den"]);
  var sign = w.elements.filter(function (e) { return e.classes[0] === "sign"; });
  eq(sign.length, 0); // not in a room and no id
});

test("Loader.read sets the globals and attaches whenClicked scripts by name", function () {
  Toolbox.reset();
  var fn = function () {};
  whenClicked("light", fn);
  var w = Loader.read(minidom(HTML).body);
  eq(w.rooms.den.hotspots.lamp.run === fn, true);
  eq(w.rooms.den.hotspots.hatch.run, undefined);
  eq(Object.keys(globalThis.NOTES), ["n"]);
  Toolbox.reset();
});
