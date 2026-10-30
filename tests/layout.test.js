// Browser only, migration-only (Task 14 deletes it), inside the real game page at 1600x900
// (tests/playtest.html adds it there with HOTSPOT_BOXES and RENAMES): every button over the picture
// sits where its drawing part was before the restructure, within 0.2% of the picture.
if (typeof document !== "undefined") {
  (function () {
    // A button's id before the restructure (RENAMES lists old id -> new id per room).
    function oldId(roomId, id) {
      var map = RENAMES.hotspots[roomId] || {};
      for (var old in map) if (map[old] === id) return old;
      return id;
    }

    function round(n) { return Math.round(n * 100) / 100; }

    test("every button sits where its drawing part was", function () {
      var problems = [];
      var sections = document.querySelectorAll("section.room");
      ok(sections.length > 0, "index.html has rooms");
      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var wasHere = section.classList.contains("here");
        section.classList.add("here");
        var stage = section.getBoundingClientRect();
        var seen = {};
        if (!stage.width || Math.abs(stage.width / stage.height - 16 / 9) > 0.01) {
          problems.push(section.id + ": the picture is " + round(stage.width) + "x" + round(stage.height) + ", not 16:9");
        } else {
          for (var j = 0; j < section.children.length; j++) {
            var b = section.children[j];
            var tag = b.tagName.toLowerCase();
            if (tag !== "button" && tag !== "a") continue;
            var old = oldId(section.id, b.id);
            seen[old] = true;
            var box = (HOTSPOT_BOXES[section.id] || {})[old];
            if (!box) {
              problems.push(section.id + " #" + b.id + ": no recorded box for " + old);
              continue;
            }
            var wasHidden = b.hidden;
            b.hidden = false;
            var r = b.getBoundingClientRect();
            b.hidden = wasHidden;
            var got = [
              (r.left - stage.left) / stage.width * 100, (r.top - stage.top) / stage.height * 100,
              r.width / stage.width * 100, r.height / stage.height * 100,
            ];
            var want = [box[0] / 16, box[1] / 9, box[2] / 16, box[3] / 9];
            for (var k = 0; k < 4; k++) {
              if (!(Math.abs(got[k] - want[k]) <= 0.2)) {
                problems.push(section.id + " #" + b.id + ": at " + got.map(round).join(", ") + "%, recorded " + want.map(round).join(", ") + "%");
                break;
              }
            }
          }
          Object.keys(HOTSPOT_BOXES[section.id] || {}).forEach(function (old) {
            if (!seen[old]) problems.push(section.id + ": no button for the recorded " + old);
          });
        }
        if (!wasHere) section.classList.remove("here");
      }
      ok(!problems.length, problems.join("\n"));
    });
  })();
}
