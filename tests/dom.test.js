// Browser-only tests of the view. Skipped in Node, where there is no page.
if (typeof document !== "undefined") {
  (function () {
    function part(attrs) {
      var box = document.createElement("div");
      box.innerHTML = "<svg><g " + attrs + "></g></svg>";
      return { box: box, g: box.querySelector("g") };
    }
    function hidden(g) { return g.style.display === "none"; }

    // "test-thing" is a name no hotspot in the real story has, so its data-hidden decides.
    test("applyVisibility: data-hidden starts hidden, show and hide change it", function () {
      Game.useStorage(false);
      Game.newGame();
      var p = part('data-name="test-thing" data-hidden');
      View.applyVisibility(p.box, "entrance");
      ok(hidden(p.g), "hidden at the start");
      Game.setShown("test-thing", true);
      View.applyVisibility(p.box, "entrance");
      ok(!hidden(p.g), "shown");
      Game.setShown("test-thing", false);
      View.applyVisibility(p.box, "entrance");
      ok(hidden(p.g), "hidden again");
      var q = part('data-name="test-thing"');
      View.applyVisibility(q.box, "entrance");
      ok(hidden(q.g), "a part without data-hidden hides too");
    });

    test("applyVisibility: data-light-only goes when the lights go out", function () {
      Game.useStorage(false);
      Game.newGame();
      var p = part('data-name="test-glow" data-light-only');
      View.applyVisibility(p.box, "entrance");
      ok(!hidden(p.g), "shown while the lights are on");
      Game.setDark(true);
      View.applyVisibility(p.box, "entrance");
      ok(hidden(p.g), "hidden in the dark");
      Game.setDark(false);
      View.applyVisibility(p.box, "entrance");
      ok(!hidden(p.g), "back when the lights come on");
    });

    test("applyVisibility: data-dark-only shows only in the dark", function () {
      Game.useStorage(false);
      Game.newGame();
      var p = part('data-name="test-marks" data-dark-only');
      View.applyVisibility(p.box, "entrance");
      ok(hidden(p.g), "hidden while the lights are on");
      Game.setDark(true);
      View.applyVisibility(p.box, "entrance");
      ok(!hidden(p.g), "shown in the dark");
      Game.setShown("test-marks", false);
      View.applyVisibility(p.box, "entrance");
      ok(hidden(p.g), "hide still wins in the dark");
    });

    test("capitalize starts a sentence with a capital letter", function () {
      eq(View.capitalize("your sister?"), "Your sister?");
      eq(View.capitalize("the cat's tree house"), "The cat's tree house");
      eq(View.capitalize("Hallway"), "Hallway");
      eq(View.capitalize(""), "");
    });

    test("act ignores a second click that comes right after the first", function () {
      var n = 0;
      function bump() { n++; return null; }
      eq(View.act(bump), true);
      eq(View.act(bump), false);
      eq(n, 1);
    });

    test("touch: the first tap arms a hotspot, the second tap uses it", function () {
      var a = document.createElement("div");
      var b = document.createElement("div");
      eq(View.touchTap(a), false, "first tap only looks");
      ok(a.classList.contains("armed"), "a glows");
      eq(View.touchTap(a), true, "second tap uses");
      ok(!a.classList.contains("armed"), "glow goes away");
      View.touchTap(a);
      eq(View.touchTap(b), false, "tapping something else only looks at it");
      ok(!a.classList.contains("armed") && b.classList.contains("armed"), "the glow moves to b");
      View.touchTap(null);
      ok(!b.classList.contains("armed"), "tapping nothing clears the glow");
    });

    // ---- parity: the browser and minidom read the same world out of index.html ----

    // The browser writes innerHTML back out its own way. Spellings that differ for the same text:
    // & / &amp;, " / &quot; and <br/> / <br>. (The page uses no &nbsp;, &lt;, &gt; or single quotes
    // around attributes; add them here if it ever does.)
    function spelledAlike(text) {
      return text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/<br\s*\/>/g, "<br>");
    }
    // A copy without scripts (JSON drops functions), every string spelled alike.
    function plainWorld(rooms, notes, endings) {
      return JSON.parse(JSON.stringify({ rooms: rooms, notes: notes, endings: endings }, function (key, value) {
        return typeof value === "string" ? spelledAlike(value) : value;
      }));
    }
    // Where two plain values first differ, for a readable failure.
    function difference(a, b, at) {
      if (JSON.stringify(a) === JSON.stringify(b)) return null;
      if (!a || !b || typeof a !== "object" || typeof b !== "object") return at + ": " + JSON.stringify(a) + " vs " + JSON.stringify(b);
      var keys = Object.keys(a).concat(Object.keys(b));
      for (var i = 0; i < keys.length; i++) {
        var d = difference(a[keys[i]], b[keys[i]], at + "." + keys[i]);
        if (d) return d;
      }
      return at + ": the keys are in a different order";
    }

    test("the game read the same rooms, notes and endings from the page as minidom does", function () {
      ok(typeof minidom === "function", "tests/playtest.html adds tests/minidom.js to the page");
      var xhr = new XMLHttpRequest(); // builder-only, over http: index.html as it is on disk
      xhr.open("GET", location.href.split("#")[0], false);
      xhr.send();
      var built = Loader.build(minidom(xhr.responseText).body);
      var fromPage = plainWorld(ROOM_INFO, NOTES, ENDINGS);
      var fromSource = plainWorld(built.rooms, built.notes, built.endings);
      ok(Object.keys(fromSource.rooms).length > 0, "index.html has rooms");
      var d = difference(fromPage, fromSource, "world");
      ok(!d, d);
    });

    var box100 = { left: 0, top: 0, right: 100, bottom: 100 };

    test("circleHitsRect inside", function () {
      eq(View.circleHitsRect(50, 50, 10, box100), true);
    });

    test("circleHitsRect touching edge", function () {
      eq(View.circleHitsRect(110, 50, 10, box100), true);
    });

    test("circleHitsRect outside", function () {
      eq(View.circleHitsRect(130, 50, 10, box100), false);
    });

    test("circleHitsRect corner", function () {
      eq(View.circleHitsRect(108, 108, 10, box100), false);
    });
  })();
}
