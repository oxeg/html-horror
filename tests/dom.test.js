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

    // ---- the buttons over the picture ----

    // View.act ignores clicks for 0.35 s after one. The tests can't wait, so they move the clock on.
    var realNow = Date.now;
    var skipped = 0;
    function cooldownOver() {
      skipped += 1000;
      Date.now = function () { return realNow.call(Date) + skipped; };
    }

    // A fresh game in this room with the lights on, drawn by the real view.
    function inRoom(roomId) {
      Game.useStorage(false);
      Game.newGame();
      Game.editJump(roomId, "19:30");
      View.render();
      cooldownOver();
    }

    // Counts what reaches Game.click until stop().
    function clickCounter() {
      var real = Game.click;
      var counter = { n: 0, stop: function () { Game.click = real; } };
      Game.click = function (name) { counter.n++; return real(name); };
      return counter;
    }

    function middleOf(el) {
      var r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    // Runs fn as if the last thing that touched the screen was a finger, then puts the mouse back.
    function withFinger(fn) {
      var wasTouch = document.documentElement.classList.contains("touch");
      var at = middleOf(document.querySelector("section.room.here"));
      document.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", clientX: at.x, clientY: at.y }));
      try {
        fn();
      } finally {
        document.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "mouse", clientX: at.x, clientY: at.y }));
        if (!wasTouch) document.documentElement.classList.remove("touch");
      }
    }

    // A tap with a finger: pointerdown, then the click the browser makes (detail 1).
    function tap(el) {
      var at = middleOf(el);
      el.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", bubbles: true, clientX: at.x, clientY: at.y }));
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1, clientX: at.x, clientY: at.y }));
    }

    function drawingPart(roomId, name) { return document.querySelector("#" + roomId + ' .drawing [data-name="' + name + '"]'); }

    test("the buttons are named for screen readers, with no tooltips, and each has its drawing", function () {
      ok(!document.querySelector("section.room[title], section.room [title]"), "a title would pop up a tooltip that gives things away in the dark");
      eq(document.getElementById("living").getAttribute("aria-label"), "Living room");
      eq(document.getElementById("fridge").getAttribute("aria-label"), "Fridge");
      ok(drawingPart("living", "fridge"), "the living room's drawing is in its section");
      eq(document.querySelectorAll("section.room > .plain").length, 0, "every button in the game has a part in its drawing");
    });

    test("touch: the first tap arms a button, the second uses it", function () {
      inRoom("living");
      var fridge = document.getElementById("fridge");
      var counter = document.getElementById("counter");
      var clicks = clickCounter();
      withFinger(function () {
        try {
          tap(fridge);
          eq(clicks.n, 0, "the first tap only looks");
          ok(fridge.classList.contains("armed"), "the fridge is armed");
          ok(drawingPart("living", "fridge").classList.contains("lit"), "its drawing glows");
          eq(document.getElementById("ui-label").textContent, "Fridge", "its name shows");
          tap(fridge);
          eq(clicks.n, 1, "the second tap uses it");
          ok(!fridge.classList.contains("armed"), "the glow goes away");
        } finally {
          clicks.stop();
        }
      });
      View.touchTap(fridge);
      eq(View.touchTap(counter), false, "tapping something else only looks at it");
      ok(!fridge.classList.contains("armed") && counter.classList.contains("armed"), "the glow moves to the counter");
      View.touchTap(null);
      ok(!counter.classList.contains("armed"), "tapping nothing clears the glow");
    });

    test("Enter on a focused button acts once", function () {
      inRoom("living");
      var fridge = document.getElementById("fridge");
      fridge.focus();
      ok(document.activeElement === fridge, "the fridge takes the focus");
      var clicks = clickCounter();
      // even right after a finger touched the screen: a keyboard click is never the first of two taps
      withFinger(function () {
        try {
          fridge.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
          eq(clicks.n, 0, "the key itself does nothing: the click the browser makes for it does");
          fridge.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 0 }));
          eq(clicks.n, 1);
        } finally {
          clicks.stop();
          fridge.blur();
        }
      });
    });

    test("a link over the picture never changes the page", function () {
      inRoom("master");
      var hash = location.hash;
      document.getElementById("walk-in-door").click();
      eq(location.hash, hash, "the page didn't jump");
      eq(Game.state.room, "walk-in");
    });

    test("a hidden button can't be used even if CSS shows it", function () {
      inRoom("living");
      var reflection = document.getElementById("reflection");
      ok(reflection.hidden, "the reflection starts hidden");
      reflection.style.setProperty("display", "block", "important");
      try {
        reflection.click();
        eq(Game.state.ending, null);
      } finally {
        reflection.style.removeProperty("display");
      }
    });

    test("the beam is sized by the picture, not the window", function () {
      inRoom("living");
      var stage = document.querySelector("section.room.here");
      ok(stage, "the room you're in shows");
      stage.style.width = "800px";  // black bars at the sides: the picture is narrower than the window
      try {
        eq(Math.round(View.beamRadius()), Math.round(800 * 22 / 100)); // --flashlight-size is 22 in style.css
      } finally {
        stage.style.width = "";
      }
    });

    test("the flashlight size comes from style.css", function () {
      inRoom("living");
      var root = document.documentElement;
      var before = View.beamRadius();
      root.style.setProperty("--flashlight-size", "30");
      try {
        eq(Math.round(View.beamRadius()), Math.round(before * 30 / 22));
      } finally {
        root.style.removeProperty("--flashlight-size");
      }
    });

    test("in the dark, only the buttons in the light take the focus", function () {
      inRoom("living");
      Game.setDark(true);
      var fridge = document.getElementById("fridge");
      var sofa = document.getElementById("sofa");
      var at = middleOf(fridge);
      document.dispatchEvent(new PointerEvent("pointermove", { clientX: at.x, clientY: at.y }));
      View.render();
      eq(fridge.getAttribute("tabindex"), "0", "the fridge is in the light");
      eq(sofa.getAttribute("tabindex"), "-1", "the sofa is in the dark");
      at = middleOf(sofa);
      document.dispatchEvent(new PointerEvent("pointermove", { clientX: at.x, clientY: at.y }));
      View.render();
      eq(fridge.getAttribute("tabindex"), "-1", "the light moved away from the fridge");
      eq(sofa.getAttribute("tabindex"), "0", "and onto the sofa");
      Game.setDark(false);
      View.render();
    });

    test("pointing at a button lights its drawing", function () {
      inRoom("living");
      function point(el, on) {
        el.dispatchEvent(new MouseEvent(on ? "mouseover" : "mouseout", { bubbles: true }));
        el.dispatchEvent(new MouseEvent(on ? "mouseenter" : "mouseleave"));
      }
      var fridge = document.getElementById("fridge");
      point(fridge, true);
      ok(drawingPart("living", "fridge").classList.contains("lit"), "the fridge glows");
      point(fridge, false);
      ok(!drawingPart("living", "fridge").classList.contains("lit"), "and stops when the mouse leaves");
      var win = document.getElementById("living-window");
      point(win, true);
      ok(drawingPart("living", "window").classList.contains("lit"), "a class works too: #living-window lights the window");
      point(win, false);
      ok(!document.querySelector(".lit"), "nothing glows once the mouse is gone");
    });

    // A room off the screen is display: none, and an animation starts over when it shows again.
    test("a shake or a scare doesn't play again when you walk back into the room", function () {
      inRoom("living");
      var living = document.getElementById("living");
      var face = drawingPart("living", "face-close");  // data-scare
      View.show({ texts: [], sounds: [], shake: true, ending: null });
      ok(living.classList.contains("shake"), "the living room shakes");
      Game.setShown("face-close", true);
      View.render();
      ok(face.classList.contains("scare-in"), "the face jumps out");
      Game.go("entrance");
      View.render();
      ok(!living.classList.contains("shake"), "the room you left stops shaking");
      ok(!face.classList.contains("scare-in"), "and its face stops jumping out");
      Game.go("living");
      View.render();
      ok(!living.classList.contains("shake"), "back in the living room: no shake");
      ok(!face.classList.contains("scare-in"), "and the face, still there, stays still");
    });

    test("Space on a focused link opens the door once", function () {
      inRoom("master");
      var door = document.getElementById("walk-in-door");
      door.focus();
      ok(document.activeElement === door, "the door takes the focus");
      var hash = location.hash;
      var clicks = clickCounter();
      var space = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
      // even right after a finger touched the screen: a key is never the first of two taps
      withFinger(function () {
        try {
          door.dispatchEvent(space);
        } finally {
          clicks.stop();
        }
      });
      eq(clicks.n, 1, "one click");
      eq(Game.state.room, "walk-in", "through the door");
      eq(location.hash, hash, "the page didn't jump");
      ok(space.defaultPrevented, "Space didn't scroll the page");
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
