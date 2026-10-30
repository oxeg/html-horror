// view.js: draws the game on the screen and listens for clicks.
// You don't need to change this file. The story lives in index.html and story.js.
// It touches the page only when View.boot() is called, so the tests can load it in Node.
// Each room in index.html is a 16:9 picture: its drawing goes in underneath, and its buttons and
// links sit on top of it, invisible, where style.css puts them.

var View = (function () {
  var V = {};
  var el = {};          // the page elements we use, found in boot()
  var rooms = {};       // every <section class="room"> by its id, found in boot()
  var onScreen = null;  // the room (and open camera) on the screen right now
  var playing = false;  // false while the title screen is up
  var popups = [];
  var popupTimer = null;
  var beam = { x: 0, y: 0 };  // where the phone light points (screen pixels)
  var beamQueued = false;
  var lastPointer = "mouse";
  var armedSpot = null;       // touch: the first tap shows the label, the second tap uses it
  var litSpot = null;         // the button whose drawing glows: pointed at, focused, or tapped once
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

  // ---- the buttons over the picture ----

  // A room's buttons and links: the children of its section (not the links in its nav).
  function buttonsOf(box) {
    var out = [];
    for (var i = 0; i < box.children.length; i++) {
      var tag = box.children[i].tagName.toLowerCase();
      if (tag === "button" || tag === "a") out.push(box.children[i]);
    }
    return out;
  }

  // The button or link over the picture that an event happened on, if any.
  function spotOf(target) {
    return target && target.closest ? target.closest(".room > button, .room > a") : null;
  }

  // What the game knows about a button (its names: id first, then classes), from index.html.
  function infoOf(spot, roomId) {
    var info = ROOM_INFO[roomId || spot.parentNode.id];
    return (info && info.hotspots[spot.id]) || null;
  }

  function namesOf(spot) {
    var h = infoOf(spot);
    return (h && h.names) || [spot.id];
  }

  function inCamera(node) {
    var room = node.closest ? node.closest("section.room") : null;
    return !!room && room.classList.contains("camera");
  }

  // ---- showing and hiding, by name ----

  // A part shows when the game says its name is showing (Game.partVisible: the button with
  // that name, or else its own data-hidden), and data-light-only / data-dark-only match the lights.
  // A button shows when Game.isVisible says so (hidden in index.html means "not there yet").
  V.applyVisibility = function (box, roomId) {
    var dark = !!Game.state.dark;
    var parts = box.querySelectorAll("[data-name], [data-light-only], [data-dark-only]");
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var name = p.getAttribute("data-name");
      var on = (!name || Game.partVisible(roomId, name, p.hasAttribute("data-hidden")))
        && !(dark && p.hasAttribute("data-light-only")) && !(!dark && p.hasAttribute("data-dark-only"));
      p.style.display = on ? "" : "none";
    }
    buttonsOf(box).forEach(function (spot) {
      var h = infoOf(spot, roomId);
      if (h) spot.hidden = !Game.isVisible(h.names || [spot.id], h.hidden);
    });
  };

  // ---- the glow and the labels ----

  // Light up the drawing parts that share the button's names (and the button itself, which only
  // shows on a .plain button). light(null) turns the glow off.
  function light(spot) {
    if (litSpot) {
      var lit = litSpot.parentNode.querySelectorAll(".lit");
      for (var i = 0; i < lit.length; i++) lit[i].classList.remove("lit");
      litSpot.classList.remove("lit");
    }
    litSpot = spot || null;
    if (!spot) return;
    spot.classList.add("lit");
    namesOf(spot).forEach(function (name) {
      var parts = spot.parentNode.querySelectorAll('.drawing [data-name="' + name + '"]');
      for (var j = 0; j < parts.length; j++) parts[j].classList.add("lit");
    });
  }

  function showLabel(spot, x, y) {
    var text = Game.label(spot.id);
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
    var again = !!spot && armedSpot === spot;
    if (armedSpot) {
      armedSpot.classList.remove("armed");
      if (litSpot === armedSpot) light(null);
    }
    armedSpot = again ? null : spot || null;
    if (armedSpot) {
      armedSpot.classList.add("armed");
      light(armedSpot);
    }
    return again;
  };

  function isTouch() { return document.documentElement.classList.contains("touch"); }

  // Each room listens to the buttons over its picture (the drawing under them never catches clicks).
  function bindRoom(room) {
    room.addEventListener("mousemove", function (e) {
      var spot = spotOf(e.target);
      if (spot && inBeam(spot)) showLabel(spot, e.clientX, e.clientY); else hideLabel();
    });
    room.addEventListener("mouseleave", hideLabel);
    // pointing with a mouse lights it up (with a finger, the first tap does)
    room.addEventListener("mouseover", function (e) {
      var spot = spotOf(e.target);
      if (spot && lastPointer !== "touch") light(spot);
    });
    room.addEventListener("mouseout", function (e) {
      var spot = spotOf(e.target);
      if (spot && litSpot === spot && !spot.contains(e.relatedTarget)) light(armedSpot);
    });
    room.addEventListener("focusin", function (e) {
      var spot = spotOf(e.target);
      if (!spot || !inBeam(spot)) return;
      if (spot.matches(":focus-visible")) light(spot);
      var r = spot.getBoundingClientRect();
      showLabel(spot, r.left + r.width / 2, r.top + r.height / 2);
    });
    room.addEventListener("focusout", function (e) {
      hideLabel();
      if (litSpot && litSpot === spotOf(e.target)) light(armedSpot);
    });
    room.addEventListener("click", function (e) {
      var spot = spotOf(e.target);
      if (!spot || !inBeam(spot)) {
        V.touchTap(null);
        return hideLabel();
      }
      // A click from the keyboard (Enter or Space: detail 0) acts at once, even on a phone.
      if (e.detail !== 0 && lastPointer === "touch" && !V.touchTap(spot)) {
        var r = spot.getBoundingClientRect();
        return showLabel(spot, e.clientX || r.left + r.width / 2, e.clientY || r.top);
      }
      V.touchTap(null);
      use(spot);
    });
  }

  // The button's id is the name the game knows it by.
  function use(spot) {
    if (!playing || Game.state.ending || el.notes.className === "on") return;
    var room = Game.scene();
    var id = Game.findHotspot(room, spot.id);
    var def = id && ROOM_INFO[room].hotspots[id];
    hideLabel();
    if (!V.act(function () { return Game.click(spot.id); })) return;
    if (def && def.note && !Game.state.ending) openNotes();
  }

  // Get a room ready: its drawing goes in first, under the buttons, and a button with nothing
  // drawn for it gets the plain look, so you can see it.
  function setUpRoom(room) {
    var drawing = document.createElement("div");
    drawing.className = "drawing";
    drawing.innerHTML = ROOMS[room.id] || "";
    room.insertBefore(drawing, room.firstChild);
    buttonsOf(room).forEach(function (spot) {
      var drawn = namesOf(spot).some(function (name) { return drawing.querySelector('[data-name="' + name + '"]'); });
      if (!drawn) spot.classList.add("plain");
    });
    bindRoom(room);
  }

  // ---- the flashlight (after 21:00 the lights don't work) ----

  V.circleHitsRect = function (cx, cy, r, rect) {
    var nx = Math.max(rect.left, Math.min(cx, rect.right));
    var ny = Math.max(rect.top, Math.min(cy, rect.bottom));
    return (cx - nx) * (cx - nx) + (cy - ny) * (cy - ny) <= r * r;
  };

  function editing() { return typeof EditMode !== "undefined" && EditMode.on; }

  function isDark() { return playing && !!Game.state.dark && !editing(); }

  // flashlightSize is a share of the picture's width, not the window's: with black bars at the
  // sides, the light stays the same size on the picture.
  function beamRadius() {
    var stage = Game.state && rooms[Game.state.room];
    var width = stage ? stage.getBoundingClientRect().width : 0;
    return (width || Math.min(window.innerWidth, window.innerHeight * 16 / 9)) * SETTINGS.flashlightSize / 100;
  }
  V.beamRadius = beamRadius;

  // Is this showing? (applyVisibility hides drawing parts with display: none, and buttons with hidden)
  function isShown(node) {
    for (var n = node; n && n.nodeType === 1; n = n.parentNode) {
      if (n.hidden || (n.style && n.style.display === "none")) return false;
    }
    return true;
  }

  // In the dark you can only see (and use) what your light is on. The camera screen glows by itself.
  function inBeam(node) {
    if (!isDark() || inCamera(node)) return true;
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

  // Keep the keyboard out of the dark (and off a room under the open camera), and tell the engine
  // what the light found.
  function beamMoved() {
    if (!playing) return;
    var room = rooms[Game.state.room];
    var top = rooms[Game.state.camera] || room;
    [room, rooms[Game.state.camera]].forEach(function (box) {
      if (!box) return;
      buttonsOf(box).forEach(function (spot) {
        spot.setAttribute("tabindex", box === top && inBeam(spot) ? "0" : "-1");
      });
    });
    if (!isDark() || Game.state.danger || Game.state.ending) return;
    EVENTS.forEach(function (ev) {
      if (ev.trigger !== "beam" || !Game.state.armed[ev.id] || Game.state.fired[ev.id]) return;
      var parts = [].slice.call(room.querySelectorAll('.drawing [data-name="' + ev.group + '"]'));
      buttonsOf(room).forEach(function (spot) { if (namesOf(spot).indexOf(ev.group) >= 0) parts.push(spot); });
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
      var key = prefix + ":" + (parts[i].getAttribute("data-name") || i);
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

  // Shakes what's on the screen: the room, and the camera if it's open.
  function shake() {
    for (var id in rooms) {
      var box = rooms[id];
      box.classList.remove("shake");
      if (!box.classList.contains("here")) continue;
      box.getBoundingClientRect();
      box.classList.add("shake");
    }
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
    el.titleArt.innerHTML = ROOMS.title || "";
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
    var scene = room + (s.camera ? " + " + s.camera : "");  // s.camera: the camera room's id while it's open
    if (onScreen !== scene) {  // somewhere else now: nothing stays armed or glowing
      V.touchTap(null);
      light(null);
      onScreen = scene;
    }
    for (var id in rooms) rooms[id].classList.toggle("here", id === room || id === s.camera);
    V.applyVisibility(rooms[room], room);
    if (s.camera) V.applyVisibility(rooms[s.camera], s.camera);
    el.camera.className = s.camera ? "on" : "";  // the camera's Close button
    if (litSpot && litSpot.hidden) light(null);

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
    scares(rooms[room], room);
    if (s.camera) scares(rooms[s.camera], s.camera);
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

  // Take what the engine returned: queue its texts, play its sounds, redraw, then shake what's
  // on the screen now (the room you just walked into, if you moved).
  V.show = function (result) {
    (result.sounds || []).forEach(play);
    if (!result.ending) queuePopups(result.texts || []);
    V.render();
    if (result.shake) shake();
  };

  V.boot = function () {
    ["overlay", "camera", "title", "ending", "notes"].forEach(function (id) { el[id] = $(id); });
    el.clock = $("ui-clock");
    el.notesBtn = $("ui-notes-btn");
    el.mute = $("ui-mute");
    el.wait = $("ui-wait");
    el.nav = $("ui-nav");
    el.popup = $("ui-popup");
    el.label = $("ui-label");
    el.notesList = $("notes-list");
    window.addEventListener("resize", function () { if (el.notes.className === "on") fitNotes(); });
    el.titleArt = $("title-art");
    el.cont = $("title-continue");
    el.count = $("title-count");
    el.endTitle = $("ending-title");
    el.endText = $("ending-text");
    el.endButtons = $("ending-buttons");

    // A title would pop up as a tooltip and give things away in the dark: it becomes an aria-label.
    var titled = document.querySelectorAll("section.room[title], section.room [title]");
    for (var i = 0; i < titled.length; i++) {
      titled[i].setAttribute("aria-label", titled[i].getAttribute("title"));
      titled[i].removeAttribute("title");
    }
    var sections = document.querySelectorAll("section.room");
    for (var j = 0; j < sections.length; j++) {
      rooms[sections[j].id] = sections[j];
      setUpRoom(sections[j]);
    }
    // Links over the picture are doors in the game: the page itself never jumps, and a long
    // press on a phone doesn't open the browser's link menu.
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest('a[href^="#"]')) e.preventDefault();
    });
    document.addEventListener("contextmenu", function (e) { if (spotOf(e.target)) e.preventDefault(); });
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
