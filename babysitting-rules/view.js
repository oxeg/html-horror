// view.js: draws the game on the screen and listens for clicks.
// You don't need to change this file. The story lives in story.js.
// It touches the page only when View.boot() is called, so the tests can load it in Node.

var View = (function () {
  var V = {};
  var el = {};          // the page elements we use, found in boot()
  var drawn = null;     // which drawing is in #scene right now
  var drawnCamera = null;
  var playing = false;  // false while the title screen is up
  var popups = [];
  var popupTimer = null;
  var beam = { x: 0, y: 0 };  // where the phone light points (screen pixels)
  var beamQueued = false;
  var lastPointer = "mouse";
  var armedSpot = null;       // touch: the first tap shows the label, the second tap uses it
  var scared = {};            // data-scare parts that already jumped out

  function $(id) { return document.getElementById(id); }

  function words(text) { return text ? text.split(/\s+/).filter(Boolean) : []; }

  function play(name) {
    if (typeof Sound !== "undefined" && Sound.play) Sound.play(name);
  }

  // ---- flags: show or hide parts of a drawing ----

  // data-show-if="a b": visible only when ALL the flags are on.
  // data-hide-if="a b": hidden when ANY of the flags is on.
  V.applyFlags = function (root, flags) {
    var parts = root.querySelectorAll("[data-show-if], [data-hide-if]");
    for (var i = 0; i < parts.length; i++) {
      var show = words(parts[i].getAttribute("data-show-if"));
      var hide = words(parts[i].getAttribute("data-hide-if"));
      var hidden = show.some(function (f) { return !flags[f]; }) || hide.some(function (f) { return flags[f]; });
      parts[i].style.display = hidden ? "none" : "";
    }
  };

  // ---- the drawing, hotspots and labels ----

  // Put a drawing in a box, and make its hotspots reachable with the keyboard too.
  function inject(box, roomId) {
    box.innerHTML = ROOMS[roomId] || "";
    var spots = box.querySelectorAll("[data-hotspot]");
    for (var i = 0; i < spots.length; i++) {
      spots[i].setAttribute("tabindex", "0");
      spots[i].setAttribute("role", "button");
    }
  }

  function hotspotOf(target) {
    return target.closest ? target.closest("[data-hotspot]") : null;
  }

  function showLabel(spot, x, y) {
    var text = Game.label(spot.getAttribute("data-hotspot"));
    if (!text) return hideLabel();
    el.label.textContent = text;
    el.label.style.left = x + "px";
    el.label.style.top = y + "px";
    el.label.className = "on";
  }

  function hideLabel() { el.label.className = ""; }

  function bindHotspots(box) {
    box.addEventListener("mousemove", function (e) {
      var spot = hotspotOf(e.target);
      if (spot && inBeam(spot)) showLabel(spot, e.clientX, e.clientY); else hideLabel();
    });
    box.addEventListener("mouseleave", hideLabel);
    box.addEventListener("focusin", function (e) {
      var spot = hotspotOf(e.target);
      if (!spot || !inBeam(spot)) return;
      var r = spot.getBoundingClientRect();
      showLabel(spot, r.left + r.width / 2, r.top + r.height / 2);
    });
    box.addEventListener("focusout", hideLabel);
    box.addEventListener("click", function (e) {
      var spot = hotspotOf(e.target);
      if (!spot || !inBeam(spot)) {
        armedSpot = null;
        return hideLabel();
      }
      if (lastPointer === "touch" && armedSpot !== spot) {
        armedSpot = spot;
        var r = spot.getBoundingClientRect();
        return showLabel(spot, e.clientX || r.left + r.width / 2, e.clientY || r.top);
      }
      armedSpot = null;
      clickHotspot(spot.getAttribute("data-hotspot"));
    });
    box.addEventListener("keydown", function (e) {
      var spot = hotspotOf(e.target);
      if (spot && inBeam(spot) && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        clickHotspot(spot.getAttribute("data-hotspot"));
      }
    });
  }

  function clickHotspot(id) {
    var info = ROOM_INFO[Game.scene()];
    var def = info && info.hotspots && info.hotspots[id];
    hideLabel();
    V.show(Game.click(id));
    if (def && def.note && !Game.state.ending) openNotes();
  }

  // ---- the flashlight (after 21:00 the lights don't work) ----

  V.circleHitsRect = function (cx, cy, r, rect) {
    var nx = Math.max(rect.left, Math.min(cx, rect.right));
    var ny = Math.max(rect.top, Math.min(cy, rect.bottom));
    return (cx - nx) * (cx - nx) + (cy - ny) * (cy - ny) <= r * r;
  };

  function isDark() { return playing && !!Game.state.flags.dark; }

  function beamRadius() { return window.innerWidth * SETTINGS.flashlightSize / 100; }

  // Is this part of the drawing showing? (applyFlags hides parts with display: none)
  function isShown(node) {
    for (var n = node; n && n.nodeType === 1; n = n.parentNode) if (n.style && n.style.display === "none") return false;
    return true;
  }

  // In the dark you can only see (and use) what your light is on. The camera screen glows by itself.
  function inBeam(node) {
    if (!isDark() || el.cameraArt.contains(node)) return true;
    // 0.8: the edge of the light is too dim to see by, so it doesn't count
    return isShown(node) && V.circleHitsRect(beam.x, beam.y, beamRadius() * 0.8, node.getBoundingClientRect());
  }

  function moveBeam(x, y) {
    beam.x = x;
    beam.y = y;
    el.overlay.style.setProperty("--fx", x + "px");
    el.overlay.style.setProperty("--fy", y + "px");
    if (beamQueued) return;
    beamQueued = true;
    requestAnimationFrame(function () {
      beamQueued = false;
      beamMoved();
    });
  }

  // Keep the keyboard out of the dark, and tell the engine what the light found.
  function beamMoved() {
    if (!playing) return;
    var spots = el.scene.querySelectorAll("[data-hotspot]");
    for (var i = 0; i < spots.length; i++) spots[i].setAttribute("tabindex", inBeam(spots[i]) ? "0" : "-1");
    if (!isDark() || Game.state.danger || Game.state.ending) return;
    EVENTS.forEach(function (ev) {
      if (ev.trigger !== "beam" || !Game.state.armed[ev.id] || Game.state.fired[ev.id]) return;
      var parts = el.scene.querySelectorAll('[data-name="' + ev.group + '"], [data-hotspot="' + ev.group + '"]');
      for (var j = 0; j < parts.length; j++) {
        if (inBeam(parts[j])) return V.show(Game.beamTouched(ev.group));
      }
    });
  }

  // The light flickers a little, and a lot when something is wrong.
  function flicker() {
    var danger = playing && Game.state.danger;
    var wobble = danger ? 0.12 : 0.03;
    var dip = Math.random() < (danger ? 0.08 : 0.015) ? 0.7 : 1;
    var r = beamRadius() * dip * (1 + (Math.random() - 0.5) * wobble);
    el.overlay.style.setProperty("--fr", Math.round(r) + "px");
  }

  // Parts marked data-scare jump out (with the sting sound) the moment they appear.
  function scares(box, prefix) {
    var parts = box.querySelectorAll("[data-scare]");
    for (var i = 0; i < parts.length; i++) {
      var key = prefix + ":" + (parts[i].getAttribute("data-name") || parts[i].getAttribute("data-hotspot") || i);
      if (!isShown(parts[i])) {
        delete scared[key];
      } else if (!scared[key]) {
        scared[key] = true;
        parts[i].classList.remove("scare-in");
        parts[i].getBoundingClientRect(); // restart the animation
        parts[i].classList.add("scare-in");
        play("sting");
      }
    }
  }

  function shake() {
    [el.scene, el.cameraArt].forEach(function (box) {
      box.classList.remove("shake");
      box.getBoundingClientRect();
      box.classList.add("shake");
    });
  }

  // ---- popups: short texts at the bottom of the scene ----

  function nextPopup() {
    clearTimeout(popupTimer);
    if (!popups.length) {
      el.popup.className = "";
      return;
    }
    var text = popups.shift();
    el.popup.innerHTML = text;
    el.popup.className = "on";
    popupTimer = setTimeout(nextPopup, 3500 + text.length * 40);
  }

  // A new action's texts replace whatever was still showing: what just happened matters most.
  function queuePopups(texts) {
    if (!texts.length) return;
    popups = texts.slice();
    nextPopup();
  }

  // ---- notes ----

  function renderNotes() {
    var found = Game.state.notes;
    var html = "";
    found.forEach(function (id) {
      var n = NOTES[id];
      if (n) html += '<div class="note ' + n.look + '"><h2>' + n.title + "</h2><p>" + n.text + "</p></div>";
    });
    el.notesList.innerHTML = html || '<p class="none">No notes yet.</p>';
    el.notesList.className = found.length > 1 ? "both" : "";
  }

  function openNotes() {
    renderNotes();
    el.notes.className = "on";
  }

  function closeNotes() { el.notes.className = ""; }

  // ---- title and ending screens ----

  function showTitle() {
    playing = false;
    inject(el.titleArt, "title");
    el.cont.style.display = Game.hasSave() ? "" : "none";
    el.count.textContent = "Endings found: " + Game.endingsFound().length + "/" + Object.keys(ENDINGS).length;
    el.ending.className = "";
    closeNotes();
    el.title.className = "on";
    document.body.classList.remove("playing");
  }

  function startPlaying(result) {
    playing = true;
    scared = {};
    el.title.className = "";
    document.body.classList.add("playing");
    popups = [];
    nextPopup();
    if (result) V.show(result); else V.render();
  }

  function showEnding(id) {
    var end = ENDINGS[id];
    popups = [];
    nextPopup();
    closeNotes();
    el.endTitle.textContent = end.title;
    el.endText.innerHTML = end.text;
    el.endButtons.innerHTML = "";
    function button(text, fn) {
      var b = document.createElement("button");
      b.textContent = text;
      b.addEventListener("click", fn);
      el.endButtons.appendChild(b);
    }
    if (end.win) {
      button("Back to title", showTitle);
    } else {
      button("Try again", function () { scared = {}; V.show(Game.tryAgain()); });
      button("Start over", function () { scared = {}; V.show(Game.startOver()); });
    }
    el.ending.className = "on";
  }

  // ---- putting it all on the screen ----

  V.render = function () {
    if (!playing) return;
    var s = Game.state;
    var room = s.room;
    if (drawn !== room) {
      inject(el.scene, room);
      drawn = room;
    }
    V.applyFlags(el.scene, s.flags);

    if (s.camera) {
      if (!drawnCamera) {
        inject(el.cameraArt, Game.scene());
        drawnCamera = true;
      }
      V.applyFlags(el.cameraArt, s.flags);
      el.camera.className = "on";
    } else {
      el.camera.className = "";
      drawnCamera = null;
    }

    el.clock.textContent = Game.clock();
    el.notesBtn.style.display = s.notes.length ? "" : "none";
    el.wait.textContent = Game.waitLabel();

    el.nav.innerHTML = "";
    Game.exits().forEach(function (to) {
      var b = document.createElement("button");
      b.textContent = ROOM_INFO[to].name;
      b.addEventListener("click", function () { V.show(Game.go(to)); });
      el.nav.appendChild(b);
    });

    document.body.classList.toggle("dark", isDark());
    document.body.classList.toggle("danger", !!s.danger);
    scares(el.scene, room);
    if (s.camera) scares(el.cameraArt, "camera");
    beamMoved();

    if (s.ending) showEnding(s.ending); else el.ending.className = "";
  };

  // Take what the engine returned: queue its texts, play its sounds, then redraw.
  V.show = function (result) {
    (result.sounds || []).forEach(play);
    if (result.shake) shake();
    if (result.ending) {
      V.render();
      return;
    }
    queuePopups(result.texts || []);
    V.render();
  };

  V.boot = function () {
    ["scene", "overlay", "camera", "title", "ending", "notes"].forEach(function (id) { el[id] = $(id); });
    el.clock = $("ui-clock");
    el.notesBtn = $("ui-notes-btn");
    el.wait = $("ui-wait");
    el.nav = $("ui-nav");
    el.popup = $("ui-popup");
    el.label = $("ui-label");
    el.cameraArt = $("camera-art");
    el.notesList = $("notes-list");
    el.titleArt = $("title-art");
    el.cont = $("title-continue");
    el.count = $("title-count");
    el.endTitle = $("ending-title");
    el.endText = $("ending-text");
    el.endButtons = $("ending-buttons");

    bindHotspots(el.scene);
    bindHotspots(el.cameraArt);
    document.addEventListener("pointerdown", function (e) {
      lastPointer = e.pointerType || "mouse";
      if (lastPointer === "touch") moveBeam(e.clientX, e.clientY);
    });
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "touch" || e.buttons) moveBeam(e.clientX, e.clientY);
    });
    moveBeam(window.innerWidth / 2, window.innerHeight / 2);
    setInterval(flicker, 90);
    $("camera-close").addEventListener("click", function () {
      Game.closeCamera();
      V.render();
    });
    el.wait.addEventListener("click", function () { V.show(Game.wait()); });
    el.notesBtn.addEventListener("click", openNotes);
    $("notes-close").addEventListener("click", closeNotes);
    el.notes.addEventListener("click", function (e) { if (e.target === el.notes) closeNotes(); });
    el.popup.addEventListener("click", nextPopup);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNotes(); });
    $("title-start").addEventListener("click", function () {
      startPlaying(Game.newGame());
    });
    el.cont.addEventListener("click", function () {
      if (Game.continueGame()) startPlaying();
    });
    showTitle();
  };

  return V;
})();
