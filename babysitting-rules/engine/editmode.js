// editmode.js: press E while playing to see behind the scenes.
// The flashlight turns off, every clickable thing gets a box with its id, and a panel
// lets you jump to any room and time, show or hide things by name, and turn the lights off.
// You don't need to change this file.

var EditMode = (function () {
  var M = { on: false };
  var panel = null;
  var boxes = null;

  // Every name worth a checkbox: the parts the drawings hide (data-hidden), the hidden
  // hotspots, and what the dangers in rules.js show or hide.
  function allNames() {
    var found = {};
    function add(list) { (list || []).forEach(function (n) { found[n] = true; }); }
    function moment(m) { add((m || {}).show); add((m || {}).hide); }
    add(Loader.hiddenInDrawings());
    Object.keys(ROOM_INFO).forEach(function (id) {
      var spots = ROOM_INFO[id].hotspots || {};
      Object.keys(spots).forEach(function (h) {
        if (spots[h].hidden) add([h]);
        moment(spots[h]);
      });
    });
    EVENTS.forEach(function (ev) {
      moment(ev);
      add(ev.armShow);
      var d = ev.danger || (ev.run && Toolbox.pretend(ev).danger) || {};
      (d.steps || []).forEach(function (s) { moment(s.then); });
      ((d.hold || {}).steps || []).forEach(moment);
      moment(d.whenSafe);
    });
    return Object.keys(found).sort();
  }

  function buildPanel() {
    panel = document.createElement("div");
    panel.id = "edit-panel";
    var rooms = Object.keys(ROOM_INFO).filter(function (id) { return !ROOM_INFO[id].overlay; });
    var html = "<b>Edit mode</b> (press E to play again)<br>";
    html += '<label>Room <select id="edit-room">';
    rooms.forEach(function (id) { html += '<option value="' + id + '">' + id + "</option>"; });
    html += '</select></label> <label>Time <input id="edit-time" size="5" value="21:30"></label> ';
    html += '<button id="edit-go">Go</button><div id="edit-flags">';
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
    panel.querySelector("#edit-flags").addEventListener("change", function (e) {
      var name = e.target.getAttribute("data-shown");
      if (e.target.id === "edit-dark") Game.setDark(e.target.checked);
      else if (name) Game.setShown(name, e.target.checked);
      else return;
      View.render();
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
  };

  return M;
})();
