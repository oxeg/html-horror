// Browser only (tests/playtest.html loads it; tests/run-node.js doesn't): replays every playthrough
// the way tests/tools/visibility.html recorded it before the restructure, and checks that the same
// drawing parts show after every step (VISIBLE_PARTS in tests/fixtures/visible-parts.js).
// The one allowed difference: feed-empty may also show in the camera, where the feeds cover it.
if (typeof document !== "undefined") {
  (function () {
    function makeBox() {
      var box = document.createElement("div");
      box.style.cssText = "position: absolute; left: -20000px; top: 0; width: 1600px; height: 900px; overflow: hidden";
      document.body.appendChild(box);
      return box;
    }

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

    // The recorder drew every step with the real view, whose light sits in the middle of the
    // picture: in the dark it finds an armed beam rule's part (rule 3's face in my room) at once.
    function lightFinds(scene) {
      var s = Game.state;
      if (!s.dark || s.danger || s.ending) return;
      EVENTS.forEach(function (ev) {
        if (ev.trigger !== "beam" || !s.armed[ev.id] || s.fired[ev.id]) return;
        if (partsIn(scene).indexOf(ev.group) >= 0) Game.beamTouched(ev.group);
      });
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
      var scene = makeBox();
      var camera = makeBox();
      var problems = [];
      var at = 0;
      try {
        PLAYTHROUGHS.forEach(function (pt) {
          Game.useStorage(false);
          Game.newGame();
          var drawn = null;
          var cameraDrawn = false;
          pt.steps.forEach(function (step, i) {
            playStep(step);
            var room = Game.state.room;
            if (drawn !== room) {
              scene.innerHTML = ROOMS[room] || "";
              drawn = room;
            }
            View.applyVisibility(scene, room);
            lightFinds(scene);
            View.applyVisibility(scene, room);
            var inCamera = [];
            if (Game.state.camera) {
              if (!cameraDrawn) {
                camera.innerHTML = ROOMS[Game.scene()] || "";
                cameraDrawn = true;
              }
              View.applyVisibility(camera, Game.scene());
              inCamera = partsIn(camera);
            } else {
              cameraDrawn = false;
            }
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
      } finally {
        document.body.removeChild(scene);
        document.body.removeChild(camera);
      }
      ok(!problems.length, problems.join("\n"));
    });
  })();
}
