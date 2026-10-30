// check.js: looks over index.html's rooms, notes and endings, story.js and the rooms/ drawings
// before the game starts and reports mistakes in plain words. Errors stop the game; warnings
// are only a note.
// It never touches the page, so the tests can run it in Node too.

var Check = (function () {
  var C = {};

  function ids(obj) { return Object.keys(obj || {}); }

  function isRoom(id) { return Object.prototype.hasOwnProperty.call(ROOM_INFO, id); }

  function hasDrawing(id) { return typeof ROOMS[id] === "string" && ROOMS[id].length > 0; }

  function list(value) { return Array.isArray(value) ? value : [value]; }

  // The hotspot a name points at in a room: its id, or one of its names (a class in index.html).
  function spotNamed(roomId, name) {
    var id = Game.findHotspot(roomId, name);
    return id ? ROOM_INFO[roomId].hotspots[id] : null;
  }

  // ---- the walking graph: exits plus hotspots that move you (goTo) ----

  function neighbours(roomId) {
    var info = ROOM_INFO[roomId];
    var out = (info.exits || []).filter(isRoom);
    ids(info.hotspots).forEach(function (h) {
      var to = info.hotspots[h].goTo;
      if (to && isRoom(to) && out.indexOf(to) < 0) out.push(to);
    });
    return out;
  }

  // Number of moves from one room to every room it can reach.
  function distances(from) {
    var dist = {};
    var queue = [from];
    dist[from] = 0;
    while (queue.length) {
      var r = queue.shift();
      neighbours(r).forEach(function (n) {
        if (dist[n] === undefined) {
          dist[n] = dist[r] + 1;
          queue.push(n);
        }
      });
    }
    return dist;
  }

  // Fewest actions needed to do the steps in order, starting in fromRoom.
  // Infinity if some step can never be done.
  C.shortest = function (fromRoom, steps) {
    var best = {};
    best[fromRoom] = 0;
    function put(map, room, cost) {
      if (map[room] === undefined || cost < map[room]) map[room] = cost;
    }
    steps.forEach(function (step) {
      var next = {};
      ids(best).forEach(function (room) {
        var cost = best[room];
        if (step.leave !== undefined) {
          // Anywhere else is fine; if we are in that room, one move gets us out.
          if (room !== step.leave) return put(next, room, cost);
          var out = isRoom(room) ? neighbours(room) : [];
          if (!out.length) return put(next, room, cost + 1);
          return out.forEach(function (n) { put(next, n, cost + 1); });
        }
        var dist = isRoom(room) ? distances(room) : {};
        list(step.room).forEach(function (target) {
          if (dist[target] === undefined) return;
          if (!step.hotspot) return put(next, target, cost + dist[target]);
          var h = spotNamed(target, step.hotspot);
          put(next, (h && h.goTo) || target, cost + dist[target] + 1);
        });
      });
      best = next;
    });
    var min = Infinity;
    ids(best).forEach(function (room) { if (best[room] < min) min = best[room]; });
    return min;
  };

  // ---- where a danger can start ----

  function startRooms(ev) {
    var all = ids(ROOM_INFO).filter(function (id) { return !ROOM_INFO[id].overlay; });
    if (ev.trigger === "inRoom") return [ev.room];
    if (ev.trigger === "nextEntry" || ev.trigger === "beam") {
      return all.filter(function (id) { return Game.roomHas(id, ev.group); });
    }
    return all.filter(function (id) { return (ev.notIn || []).indexOf(id) < 0; });
  }

  // ---- the checks ----

  C.run = function () {
    var errors = [];
    var warnings = [];

    function checkRoom(where, id) {
      if (!isRoom(id)) errors.push(where + ': there is no room "' + id + '". Add it to index.html or fix the name.');
    }
    function checkEnding(where, id) {
      if (!ENDINGS[id]) errors.push(where + ': there is no ending "' + id + '". Add it to index.html or fix the name.');
    }
    function checkTime(where, time) {
      if (isNaN(Game.parseTime(time))) {
        errors.push(where + ': the time "' + time + '" is not written like 19:05 (two digits, a colon, two digits). Fix it in story.js.');
        return false;
      }
      return true;
    }

    checkRoom("story.js SETTINGS startRoom", SETTINGS.startRoom);
    checkTime("story.js SETTINGS startTime", SETTINGS.startTime);

    // rooms: exits, hotspots, drawings
    ids(ROOM_INFO).forEach(function (id) {
      var info = ROOM_INFO[id];
      (info.exits || []).forEach(function (to) {
        if (!isRoom(to)) errors.push('index.html: room "' + id + '" has an exit to "' + to + '", but there is no room "' + to + '". Fix the exit or add the room.');
      });
      ids(info.hotspots).forEach(function (h) {
        var spot = info.hotspots[h];
        var where = 'index.html: button "' + h + '" in room "' + id + '"';
        if (spot.goTo && !isRoom(spot.goTo)) errors.push(where + ' goes to "' + spot.goTo + '", but there is no room "' + spot.goTo + '".');
        if (spot.note && !NOTES[spot.note]) errors.push(where + ' gives the note "' + spot.note + '", but there is no note "' + spot.note + '".');
        if (spot.ending) checkEnding(where, spot.ending);
        if (spot.notBefore) checkTime(where + " notBefore", spot.notBefore);
      });
      if (!hasDrawing(id)) errors.push('rooms/' + id + '.js is missing: room "' + id + '" is in index.html but has no drawing. Make rooms/' + id + '.js and add it to index.html.');
    });
    if (!hasDrawing("title")) errors.push("rooms/title.js is missing: the title screen needs its drawing. Make rooms/title.js and add it to index.html.");

    // the giveaway: the real note is always signed "Love you!", a fake never is
    ids(NOTES).forEach(function (id) {
      var signed = String(NOTES[id].html).indexOf("Love you") >= 0;
      if (NOTES[id].fake && signed) {
        warnings.push('index.html: the fake note "' + id + '" says "Love you". The real note is signed "Love you!" and a fake never is: that\'s how you can tell. Take it out.');
      }
      if (!NOTES[id].fake && !signed) {
        warnings.push('index.html: the note "' + id + '" isn\'t signed "Love you!". That\'s how you tell the real note from the fake one, so keep it.');
      }
    });

    // events
    var last = -1;
    var lastId = "";
    var seenIds = {};
    var allEventIds = EVENTS.map(function (e) { return e.id; });
    function hasSpot(roomId, spot) { return !!spotNamed(roomId, spot); }
    EVENTS.forEach(function (ev) {
      var where = 'story.js: event "' + ev.id + '"';
      if (seenIds[ev.id]) errors.push(where + ' is in the list twice. Every event needs its own id: rename one of them.');
      seenIds[ev.id] = true;
      if (checkTime(where, ev.time)) {
        var t = Game.parseTime(ev.time);
        if (t < last) errors.push(where + " (" + ev.time + ') is earlier than "' + lastId + '" above it. Events must be in time order: move it up above "' + lastId + '", or change its time.');
        if (t >= last) lastId = ev.id;
        last = Math.max(last, t);
      }
      var trigger = ev.trigger || "now";
      if (["now", "nextEntry", "inRoom", "beam"].indexOf(trigger) < 0) {
        errors.push(where + ' has trigger "' + trigger + '". It must be "now", "nextEntry", "inRoom" or "beam" (capital letters matter).');
      }
      if ((trigger === "nextEntry" || trigger === "beam") && !ids(ROOM_INFO).some(function (r) { return Game.roomHas(r, ev.group); })) {
        warnings.push(where + ' waits for "' + ev.group + '", but no room drawing has a part with that name, so it will never happen.');
      }
      if (ev.after && allEventIds.indexOf(ev.after) < 0) {
        errors.push(where + ' waits for an event called "' + ev.after + '", but there is no event with that id.');
      }
      if (ev.room) checkRoom(where + " room", ev.room);
      (ev.notIn || []).forEach(function (r) { checkRoom(where + " notIn", r); });
      if (ev.ending) checkEnding(where, ev.ending);
      var d = ev.danger;
      if (!d) return;
      (d.fatal || []).forEach(function (f) {
        checkEnding(where + " fatal", f.ending);
        if (f.room) checkRoom(where + " fatal", f.room);
        if (f.hotspot && !(f.room ? hasSpot(f.room, f.hotspot) : ids(ROOM_INFO).some(function (r) { return hasSpot(r, f.hotspot); }))) {
          warnings.push(where + ' has a fatal click on "' + f.hotspot + '", but there is no clickable thing with that name' + (f.room ? ' in room "' + f.room + '"' : "") + ".");
        }
      });
      if (d.late) checkEnding(where + " late", d.late);
      if (d.hold) checkEnding(where + " hold", d.hold.fatal);
      (d.steps || []).forEach(function (s) {
        list(s.room !== undefined ? s.room : s.leave).forEach(function (r) {
          checkRoom(where + " steps", r);
          if (s.hotspot && isRoom(r) && !hasSpot(r, s.hotspot)) {
            errors.push(where + ' has a step that clicks "' + s.hotspot + '" in room "' + r + '", but that room has no clickable thing with that name.');
          }
        });
      });

      // is the deadline long enough for the worst starting room?
      if (d.steps && d.deadline) {
        var worst = 0;
        startRooms(ev).forEach(function (r) {
          if (isRoom(r)) worst = Math.max(worst, C.shortest(r, d.steps));
        });
        if (isFinite(worst) && d.deadline < worst + 1) {
          warnings.push(where + " has a deadline of " + d.deadline + ", but in the worst case it takes " + worst + " actions to finish its steps. Make the deadline at least " + (worst + 1) + " in story.js.");
        } else if (!isFinite(worst)) {
          warnings.push(where + " has steps that can never be finished from some starting room. Check the rooms and exits in story.js.");
        }
      }
    });

    return { errors: errors, warnings: warnings };
  };

  return C;
})();
