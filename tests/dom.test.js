// Browser-only tests of the view. Skipped in Node, where there is no page.
if (typeof document !== "undefined") {
  (function () {
    function part(attrs) {
      var box = document.createElement("div");
      box.innerHTML = "<svg><g " + attrs + "></g></svg>";
      return { box: box, g: box.querySelector("g") };
    }
    function hidden(g) { return g.style.display === "none"; }

    test("applyFlags show-if needs all flags", function () {
      var p = part('data-show-if="a b"');
      View.applyFlags(p.box, { a: true });
      ok(hidden(p.g), "hidden with only a");
      View.applyFlags(p.box, { a: true, b: true });
      ok(!hidden(p.g), "shown with a and b");
    });

    test("applyFlags hide-if hides on any flag", function () {
      var p = part('data-hide-if="a b"');
      View.applyFlags(p.box, {});
      ok(!hidden(p.g), "shown with none");
      View.applyFlags(p.box, { b: true });
      ok(hidden(p.g), "hidden with b");
    });

    test("applyFlags handles both on one element", function () {
      var p = part('data-show-if="a" data-hide-if="b"');
      View.applyFlags(p.box, { a: true });
      ok(!hidden(p.g), "shown with a");
      View.applyFlags(p.box, { a: true, b: true });
      ok(hidden(p.g), "hidden with a and b");
      View.applyFlags(p.box, { b: true });
      ok(hidden(p.g), "hidden without a");
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
