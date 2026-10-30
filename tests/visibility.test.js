// Browser only, inside the real game page (tests/playtest.html adds it there; tests/run-node.js
// doesn't load it): replays every playthrough the way tests/tools/visibility.html recorded it before
// the restructure, with the real View.render(), and checks that the same drawing parts show in
// #scene and #camera-art after every step (VISIBLE_PARTS in tests/fixtures/visible-parts.js).
// The one allowed difference: feed-empty may also show in the camera, where the feeds cover it.
if (typeof document !== "undefined") {
  (function () {
    // a part shows when neither it nor anything above it (inside its box) has display: none
    function shows(part, box) {
      for (var n = part; n && n !== box; n = n.parentNode) {
        if (getComputedStyle(n).display === "none") return false;
      }
      return true;
    }

    function partsIn(box) {
      var names = [];
      var parts = box.querySelectorAll("[data-name], [data-hotspot]");
      for (var i = 0; i < parts.length; i++) {
        if (shows(parts[i], box)) names.push(parts[i].getAttribute("data-name") || parts[i].getAttribute("data-hotspot"));
      }
      return names;
    }

    // What the recorder saw that we don't (missing), and what we see that it didn't (extra).
    function compare(expected, got, inCamera) {
      var missing = expected.slice();
      var extra = [];
      got.forEach(function (name) {
        var k = missing.indexOf(name);
        if (k >= 0) missing.splice(k, 1); else extra.push(name);
      });
      var k = extra.indexOf("feed-empty");
      if (k >= 0 && inCamera.indexOf("feed-empty") >= 0) extra.splice(k, 1);
      return { missing: missing, extra: extra };
    }

    test("every playthrough step shows the same drawing parts as before the restructure", function () {
      ok(document.body.classList.contains("playing"), "the game must be playing: tests/playtest.html presses Start first");
      // The recorder's light sat in the middle of the picture: put it back there.
      document.dispatchEvent(new PointerEvent("pointermove", { clientX: innerWidth / 2, clientY: innerHeight / 2 }));
      var scene = document.getElementById("scene");
      var cameraArt = document.getElementById("camera-art");
      var problems = [];
      var at = 0;
      PLAYTHROUGHS.forEach(function (pt) {
        Game.useStorage(false);
        Game.newGame();
        View.render();
        pt.steps.forEach(function (step, i) {
          playStep(step);
          View.render();
          var inCamera = document.getElementById("camera").classList.contains("on") ? partsIn(cameraArt) : [];
          var record = VISIBLE_PARTS[at++] || {};
          if (record.run !== pt.name || record.step !== i) {
            problems.push(pt.name + " step " + i + " (" + step + "): no recording for this step");
            return;
          }
          var diff = compare(record.parts, partsIn(scene).concat(inCamera).sort(), inCamera);
          if (diff.missing.length || diff.extra.length) {
            problems.push(pt.name + " step " + i + " (" + step + "): missing " + JSON.stringify(diff.missing) + ", extra " + JSON.stringify(diff.extra));
          }
        });
      });
      if (at !== VISIBLE_PARTS.length) problems.push("replayed " + at + " steps, but " + VISIBLE_PARTS.length + " were recorded");
      ok(!problems.length, problems.join("\n"));
    });
  })();
}
