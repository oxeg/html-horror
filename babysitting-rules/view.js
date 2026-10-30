// view.js: draws the game on the screen and listens for clicks.
// You don't need to change this file. The story lives in index.html and story.js.
// It touches the page only when View.boot() is called, so the tests can load it in Node.

var View = (function () {
  var V = {};
  var el = {};          // the page elements we use, found in boot()
  var drawn = null;     // which drawing is in #scene right now
  var drawnCamera = null;  // which camera drawing is in #camera-art
  var playing = false;  // false while the title screen is up
  var popups = [];
  var popupTimer = null;
  var beam = { x: 0, y: 0 };  // where the phone light points (screen pixels)
  var beamQueued = false;
  var lastPointer = "mouse";
  var armedSpot = null;       // touch: the first tap shows the label, the second tap uses it
  var scared = {};            // data-scare parts that already jumped out

  function $(id) { return document.getElementById(id); }

  // A double-click must never count twice: after one action, ignore clicks for a moment,
  // or the second click lands on whatever the first one just put under the mouse.
  var busyUntil = 0;
  V.act = function (fn) {
    var now = Date.now();
    if (now < busyUntil) return false;
    busyUntil = now + 350;
    var result = fn();
    if (result) V.show(result);
    return true;
  };

  // story.js may start a sentence with a name like "your sister": show it as "Your sister".
  V.capitalize = function (text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  };

  // sound.js may be missing from a test page: then the game just stays quiet.
  function sound(what, arg) {
    if (typeof Sound !== "undefined" && Sound[what]) return Sound[what](arg);
  }

  function play(name) { sound("play", name); }

  function showMuted() {
    var m = !!sound("muted");
    el.mute.classList.toggle("muted", m);
    el.mute.setAttribute("aria-pressed", String(m));
    el.mute.title = m ? "Sound is off" : "Sound is on";
  }

  // ---- showing and hiding parts of a drawing, by name ----

  // A part shows when the game says its name is showing (Game.partVisible: the hotspot with
  // that name, or else its own data-hidden), and data-light-only / data-dark-only match the lights.
  V.applyVisibility = function (box, roomId) {
    var dark = !!Game.state.dark;
    var parts = box.querySelectorAll("[data-name], [data-hotspot], [data-light-only], [data-dark-only]");
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var name = p.getAttribute("data-name") || p.getAttribute("data-hotspot");
      var on = (!name || Game.partVisible(roomId, name, p.hasAttribute("data-hidden")))
        && !(dark && p.hasAttribute("data-light-only")) && !(!dark && p.hasAttribute("data-dark-only"));
      p.style.display = on ? "" : "none";
    }
  };

  // ---- the drawing, hotspots and labels ----

  // Put a drawing in a box, and make its hotspots reachable with the keyboard too.
  function inject(box, roomId) {
    armedSpot = null;
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
    el.label.textContent = V.capitalize(text);
    el.label.style.left = x + "px";
    el.label.style.top = y + "px";
    el.label.className = "on";
  }

  function hideLabel() { el.label.className = ""; }

  // On a touch screen the first tap only looks (the thing glows and shows its name);
  // tapping the same thing again uses it. Returns true when the tap should use it.
  V.touchTap = function (spot) {
    if (spot && armedSpot === spot) {
      spot.classList.remove("armed");
      armedSpot = null;
      return true;
    }
    if (armedSpot) armedSpot.classList.remove("armed");
    armedSpot = spot || null;
    if (spot) spot.classList.add("armed");
    return false;
  };

  function isTouch() { return document.documentElement.classList.contains("touch"); }

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
        V.touchTap(null);
        return hideLabel();
      }
      if (lastPointer === "touch" && !V.touchTap(spot)) {
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

  // name is the drawing's data-hotspot: the button's id or one of its classes.
  function clickHotspot(name) {
    if (!playing || Game.state.ending || el.notes.className === "on") return;
    var room = Game.scene();
    var id = Game.findHotspot(room, name);
    var def = id && ROOM_INFO[room].hotspots[id];
    hideLabel();
    if (!V.act(function () { return Game.click(name); })) return;
    if (def && def.note && !Game.state.ending) openNotes();
  }

  // ---- the flashlight (after 21:00 the lights don't work) ----

  V.circleHitsRect = function (cx, cy, r, rect) {
    var nx = Math.max(rect.left, Math.min(cx, rect.right));
    var ny = Math.max(rect.top, Math.min(cy, rect.bottom));
    return (cx - nx) * (cx - nx) + (cy - ny) * (cy - ny) <= r * r;
  };

  function editing() { return typeof EditMode !== "undefined" && EditMode.on; }

  function isDark() { return playing && !!Game.state.dark && !editing(); }

  function beamRadius() { return window.innerWidth * SETTINGS.flashlightSize / 100; }

  // Is this part of the drawing showing? (applyVisibility hides parts with display: none)
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
    el.popup.innerHTML = V.capitalize(text);
    el.popup.className = "on";
    popupTimer = setTimeout(nextPopup, 3500 + text.length * 40);
  }

  // A new action's texts replace whatever was still showing: what just happened matters most.
  // All of one action's texts show together, so a danger's warning is never stuck behind another line.
  function queuePopups(texts) {
    if (!texts.length) return;
    popups = [texts.map(V.capitalize).join("<br>")];
    nextPopup();
  }

  // ---- notes ----

  // Each note you found, as index.html writes it, with the id note-<its id>.
  function renderNotes() {
    var found = Game.state.notes;
    var html = "";
    found.forEach(function (id) {
      var n = NOTES[id];
      if (n) html += '<div class="note' + (n.fake ? " fake" : "") + '" id="note-' + id + '">' + n.html + "</div>";
    });
    el.notesList.innerHTML = html || '<p class="none">No notes yet.</p>';
    el.notesList.className = found.length > 1 ? "both" : "";
  }

  // Shrink the writing until every note fits on the screen: no scroll bars, ever.
  function fitNotes() {
    var list = el.notesList;
    var notes = list.querySelectorAll(".note");
    var maxH = window.innerHeight * (isTouch() ? 0.86 : 0.82);
    var maxW = window.innerWidth * 0.94;
    var smallest = isTouch() ? 10 : 9;
    for (var size = 20; size > smallest; size -= 0.5) {
      list.style.fontSize = size + "px";
      var top = Infinity, bottom = -Infinity, left = Infinity, right = -Infinity;
      for (var i = 0; i < notes.length; i++) {
        var r = notes[i].getBoundingClientRect();
        top = Math.min(top, r.top);
        bottom = Math.max(bottom, r.bottom);
        left = Math.min(left, r.left);
        right = Math.max(right, r.right);
      }
      if (bottom - top <= maxH && right - left <= maxW) return;
    }
  }

  function openNotes() {
    renderNotes();
    el.notes.className = "on";
    fitNotes();
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

  // Called by the Start and Continue clicks: browsers only allow sound after a click.
  // On a phone: full screen (no browser bar) and locked sideways. Browsers may say no; that's fine.
  function goFullScreen() {
    if (!isTouch()) return;
    try {
      var root = document.documentElement;
      var asked = root.requestFullscreen ? root.requestFullscreen({ navigationUI: "hide" }) : null;
      Promise.resolve(asked).then(function () {
        if (screen.orientation && screen.orientation.lock) return screen.orientation.lock("landscape");
      }).catch(function () {});
    } catch (e) {}
  }

  function startPlaying(result) {
    goFullScreen();
    sound("unlock");
    sound("loop", "ambient");
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
      button("Back to title", function () { V.act(function () { showTitle(); return null; }); });
    } else {
      button("Try again", function () { V.act(function () { scared = {}; return Game.tryAgain(); }); });
      button("Start over", function () { V.act(function () { scared = {}; return Game.startOver(); }); });
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
    V.applyVisibility(el.scene, room);

    if (s.camera) {  // the camera room's id while it's open
      if (drawnCamera !== s.camera) {
        inject(el.cameraArt, s.camera);
        drawnCamera = s.camera;
      }
      V.applyVisibility(el.cameraArt, s.camera);
      el.camera.className = "on";
    } else {
      el.camera.className = "";
      drawnCamera = null;
    }

    el.clock.textContent = Game.clock();
    el.notesBtn.style.display = s.notes.length && !s.camera ? "" : "none";  // the camera's Close button sits there
    el.wait.textContent = Game.waitLabel();

    el.nav.innerHTML = "";
    Game.exits().forEach(function (to) {
      var b = document.createElement("button");
      b.textContent = V.capitalize(ROOM_INFO[to].name);
      b.addEventListener("click", function () { V.act(function () { return Game.go(to); }); });
      el.nav.appendChild(b);
    });

    document.body.classList.toggle("dark", isDark());
    document.body.classList.toggle("danger", !!s.danger);
    scares(el.scene, room);
    if (s.camera) scares(el.cameraArt, "camera");
    beamMoved();

    // the heartbeat: on while something is wrong, faster as the danger runs out of time
    if (s.danger && !s.ending) {
      sound("loop", "heartbeat");
      sound("setHeartRate", Game.dangerLevel());
    } else {
      sound("stop", "heartbeat");
    }

    if (s.ending) showEnding(s.ending); else el.ending.className = "";
    if (typeof EditMode !== "undefined") EditMode.afterRender();
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
    el.mute = $("ui-mute");
    el.wait = $("ui-wait");
    el.nav = $("ui-nav");
    el.popup = $("ui-popup");
    el.label = $("ui-label");
    el.cameraArt = $("camera-art");
    el.notesList = $("notes-list");
    window.addEventListener("resize", function () { if (el.notes.className === "on") fitNotes(); });
    el.titleArt = $("title-art");
    el.cont = $("title-continue");
    el.count = $("title-count");
    el.endTitle = $("ending-title");
    el.endText = $("ending-text");
    el.endButtons = $("ending-buttons");

    bindHotspots(el.scene);
    bindHotspots(el.cameraArt);
    if (window.matchMedia && matchMedia("(pointer: coarse)").matches) document.documentElement.classList.add("touch");
    document.addEventListener("pointerdown", function (e) {
      lastPointer = e.pointerType || "mouse";
      if (lastPointer === "touch") document.documentElement.classList.add("touch");
      if (lastPointer === "touch") moveBeam(e.clientX, e.clientY);
    });
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "touch" || e.buttons) moveBeam(e.clientX, e.clientY);
    });
    moveBeam(window.innerWidth / 2, window.innerHeight / 2);
    setInterval(flicker, 90);
    $("camera-close").addEventListener("click", function () {
      V.act(function () { Game.closeCamera(); V.render(); return null; });
    });
    el.wait.addEventListener("click", function () { V.act(function () { return Game.wait(); }); });
    el.notesBtn.addEventListener("click", openNotes);
    el.mute.addEventListener("click", function () {
      sound("setMuted", !sound("muted"));
      showMuted();
    });
    showMuted();
    $("notes-close").addEventListener("click", closeNotes);
    el.notes.addEventListener("click", function (e) { if (e.target === el.notes) closeNotes(); });
    el.popup.addEventListener("click", nextPopup);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNotes(); });
    $("title-start").addEventListener("click", function () {
      V.act(function () { startPlaying(Game.newGame()); return null; });
    });
    el.cont.addEventListener("click", function () {
      V.act(function () { if (Game.continueGame()) startPlaying(); return null; });
    });
    if (typeof EditMode !== "undefined") EditMode.boot();
    showTitle();
  };

  return V;
})();
