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
  })();
}
