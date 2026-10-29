// editmode.js: press E while playing to see behind the scenes.
// The flashlight turns off, every clickable thing gets a box with its name, and a panel
// lets you jump to any room and time, and switch any flag on or off.
// You don't need to change this file.

var EditMode = (function () {
  var M = { on: false };
  var panel = null;
  var boxes = null;

  // Every flag the game knows: the ones the drawings react to, and the ones story.js sets.
  function allFlags() {
    var found = {};
    function add(list) { (list || []).forEach(function (f) { found[f] = true; }); }
    Object.keys(ROOMS).forEach(function (id) {
      var re = /data-(?:show|hide)-if="([^"]+)"/g;
      var m;
      while ((m = re.exec(ROOMS[id]))) add(m[1].split(/\s+/));
    });
    Object.keys(ROOM_INFO).forEach(function (id) {
      var spots = ROOM_INFO[id].hotspots || {};
      Object.keys(spots).forEach(function (h) { add(spots[h].setFlags); });
    });
    EVENTS.forEach(function (ev) {
      add(ev.setFlags);
      add(ev.armFlags);
      add(ev.clearFlags);
      var d = ev.danger || {};
      (d.steps || []).forEach(function (s) { add(s.setFlags); });
      ((d.hold || {}).steps || []).forEach(function (s) { add(s.setFlags); });
      add((d.whenSafe || {}).setFlags);
      add((d.whenSafe || {}).clearFlags);
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
    allFlags().forEach(function (f) {
      html += '<label><input type="checkbox" data-flag="' + f + '"> ' + f + "</label>";
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
      var flag = e.target.getAttribute("data-flag");
      if (!flag) return;
      Game.setFlag(flag, e.target.checked);
      View.render();
    });
  }

  function markBadTime() {
    panel.querySelector("#edit-time").style.outline = "2px solid var(--danger)";
  }

  // Draw a box with its name around every clickable thing you can see.
  function drawBoxes() {
    boxes.innerHTML = "";
    var spots = document.querySelectorAll("#scene [data-hotspot], #camera.on [data-hotspot]");
    for (var i = 0; i < spots.length; i++) {
      var r = spots[i].getBoundingClientRect();
      if (!r.width || !r.height) continue;
      var b = document.createElement("div");
      b.className = "edit-box";
      b.style.left = r.left + "px";
      b.style.top = r.top + "px";
      b.style.width = r.width + "px";
      b.style.height = r.height + "px";
      b.textContent = spots[i].getAttribute("data-hotspot");
      boxes.appendChild(b);
    }
  }

  function syncPanel() {
    var s = Game.state;
    panel.querySelector("#edit-room").value = s.room;
    panel.querySelector("#edit-time").value = Game.clock();
    panel.querySelector("#edit-time").style.outline = "";
    var checks = panel.querySelectorAll("[data-flag]");
    for (var i = 0; i < checks.length; i++) checks[i].checked = !!s.flags[checks[i].getAttribute("data-flag")];
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
      if (tag === "input" || tag === "select") return;
      if ((e.key === "e" || e.key === "E") && document.body.classList.contains("playing")) M.toggle();
    });
    window.addEventListener("resize", function () { M.afterRender(); });
  };

  return M;
})();
