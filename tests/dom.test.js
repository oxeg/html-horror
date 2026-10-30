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
