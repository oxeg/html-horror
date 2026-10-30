// editmode.js: press E while playing to see behind the scenes.
// The flashlight turns off, every clickable thing gets a box with its id, and a panel
// lets you jump to any room and time, see tonight's times for every rule, show or hide things
// by name, turn the lights off, and see where the pointer is on the picture (in %, for placing
// buttons in style.css).
// You don't need to change this file.

var EditMode = (function () {
  var M = { on: false };
  var panel = null;
  var boxes = null;

  // Every name worth a checkbox: every part of the drawings, the buttons that start hidden, and
  // what the scripts in rules.js show or hide (read, not run).
  function allNames() {
    var found = {};
    function add(list) { (list || []).forEach(function (n) { found[n] = true; }); }
    function read(fn) {
      var words = Check.scanNames(fn);
      add(words.show);
      add(words.hide);
    }
    add(Loader.drawingNames());
    Object.keys(ROOM_INFO).forEach(function (id) {
      var spots = ROOM_INFO[id].hotspots || {};
      Object.keys(spots).forEach(function (h) { if (spots[h].hidden) add([h]); });
    });
    EVENTS.forEach(function (ev) {
      add(ev.armShow);
      if (ev.run) read(ev.run);
    });
    var scripts = Toolbox.clickScripts();
    Object.keys(scripts).forEach(function (name) { read(scripts[name].run); });
    return Object.keys(found).sort();
  }

  function buildPanel() {
    panel = document.createElement("div");
    panel.id = "edit-panel";
    var rooms = Object.keys(ROOM_INFO).filter(function (id) { return !ROOM_INFO[id].overlay; });
    var html = "<b>Edit mode</b> (press E to play again)<br>";
    html += '<label>Room <select id="edit-room">';
    rooms.forEach(function (id) {
      html += '<option value="' + id + '">' + id + " (" + ROOM_INFO[id].name + ")</option>";
    });
    html += '</select></label> <label>Time <input id="edit-time" size="5" value="21:30"></label> ';
    html += '<button id="edit-go">Go</button>';
    html += '<div>Pointer: <span id="edit-where">move it over the picture</span></div>';
    html += '<details id="edit-tonight"><summary>Tonight</summary><ol id="edit-night"></ol></details><div id="edit-flags">';
    html += '<label><input type="checkbox" id="edit-dark"> lights out</label>';
    allNames().forEach(function (n) {
      html += '<label><input type="checkbox" data-shown="' + n + '"> ' + n + "</label>";
    });
    html += "</div>";
    panel.innerHTML = html;
    document.body.appendChild(panel);
    boxes = document.createElement("div");
    boxes.id = "edit-boxes";
    document.body.appendChild(boxes);

    panel.querySelector("#edit-go").addEventListener("click", function () {
      var time = panel.querySelector("#edit-time").value.trim();
      if (isNaN(Game.parseTime(time))) return markBadTime();
      Game.editJump(panel.querySelector("#edit-room").value, time);
      View.render();
    });
    panel.querySelector("#edit-night").addEventListener("click", function (e) {
      var line = e.target.closest("li[data-time]");
      if (line) panel.querySelector("#edit-time").value = line.getAttribute("data-time");
    });
    panel.querySelector("#edit-flags").addEventListener("change", function (e) {
      var name = e.target.getAttribute("data-shown");
      if (e.target.id === "edit-dark") Game.setDark(e.target.checked);
      else if (name) Game.setShown(name, e.target.checked);
      else return;
      View.render();
    });
  }

  // Where the pointer is on the picture you're looking at, in % of the picture, like the lines in
  // style.css: "left: 41.2%  top: 30.5%".
  function showWhere(e) {
    if (!M.on) return;
    var top = document.querySelector("section.room.camera.here") || document.querySelector("section.room.here");
    if (!top) return;
    var r = top.getBoundingClientRect();
    var left = (e.clientX - r.left) / r.width * 100;
    var down = (e.clientY - r.top) / r.height * 100;
    panel.querySelector("#edit-where").textContent = "left: " + left.toFixed(1) + "%  top: " + down.toFixed(1) + "%";
  }

  // Tonight's rules in order: when each one comes (or "skipped" when it doesn't come tonight),
  // its line in rules.js, and what it is. The ones that happened already are greyed out.
  function listTonight() {
    var list = panel.querySelector("#edit-night");
    list.innerHTML = "";
    Toolbox.inTonightsOrder(EVENTS, Game.state).forEach(function (ev) {
      var t = Toolbox.tonight(ev, Game.state);
      var line = document.createElement("li");
      line.textContent = (t === null ? "skipped" : Game.formatTime(t)) + " · line " + ev.line + " · " + Toolbox.labelOf(ev);
      if (t !== null) line.setAttribute("data-time", Game.formatTime(t));
      if (Game.state.fired[ev.id]) line.className = "done";
      list.appendChild(line);
    });
  }

  function markBadTime() {
    panel.querySelector("#edit-time").style.outline = "2px solid var(--danger)";
  }

  // Draw a box with its id around every button and link you can see: the open camera's, or else
  // the room's.
  function drawBoxes() {
    boxes.innerHTML = "";
    var top = document.querySelector("section.room.camera.here") || document.querySelector("section.room.here");
    var spots = top ? top.querySelectorAll(":scope > button, :scope > a") : [];
    for (var i = 0; i < spots.length; i++) {
      var r = spots[i].getBoundingClientRect();
      if (!r.width || !r.height) continue;
      var b = document.createElement("div");
      b.className = "edit-box";
      b.style.left = r.left + "px";
      b.style.top = r.top + "px";
      b.style.width = r.width + "px";
      b.style.height = r.height + "px";
      b.textContent = spots[i].id;
      boxes.appendChild(b);
    }
  }

  function syncPanel() {
    var s = Game.state;
    panel.querySelector("#edit-room").value = s.room;
    panel.querySelector("#edit-time").value = Game.clock();
    panel.querySelector("#edit-time").style.outline = "";
    panel.querySelector("#edit-dark").checked = !!s.dark;
    var checks = panel.querySelectorAll("[data-shown]");
    for (var i = 0; i < checks.length; i++) checks[i].checked = Game.isShown(checks[i].getAttribute("data-shown"));
    listTonight();
  }

  M.toggle = function () {
    if (!panel) buildPanel();
    M.on = !M.on;
    document.body.classList.toggle("editing", M.on);
    View.render();
  };

  // view.js calls this after every redraw.
  M.afterRender = function () {
    if (!panel) return;
    if (!M.on) {
      boxes.innerHTML = "";
      return;
    }
    syncPanel();
    drawBoxes();
  };

  M.boot = function () {
    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "select" || (tag === "input" && e.target.type !== "checkbox")) return;  // typing a time
      if ((e.key === "e" || e.key === "E") && document.body.classList.contains("playing")) M.toggle();
    });
    window.addEventListener("resize", function () { M.afterRender(); });
    document.addEventListener("pointermove", showWhere);
  };

  return M;
})();
