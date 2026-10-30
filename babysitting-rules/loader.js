// loader.js: reads the rooms, notes and endings out of index.html, and the night out of rules.js.
// Your HTML is the story: each <section class="room"> is a room, each button or link inside it
// is something you can click, <article class="note"> is a note and <section class="ending"> is
// an ending. This file turns them into what the game uses. You don't need to change it.

var Loader = (function () {
  var L = {};
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  // Make sure these names exist before anything reads them.
  ["ROOM_INFO", "NOTES", "ENDINGS", "SETTINGS", "EVENTS"].forEach(function (name) {
    if (!(name in G)) G[name] = undefined;
  });

  function classesOf(el) {
    return (el.getAttribute("class") || "").split(/\s+/).filter(function (c) { return c; });
  }
  function hasClass(el, c) { return classesOf(el).indexOf(c) >= 0; }
  function tag(el) { return el.tagName.toLowerCase(); }
  // A plain list of an element's children (a browser gives a list without forEach or filter).
  function childrenOf(el) {
    var out = [];
    for (var i = 0; i < el.children.length; i++) out.push(el.children[i]);
    return out;
  }
  function kids(el, name, className) {
    return childrenOf(el).filter(function (c) {
      return tag(c) === name && (!className || hasClass(c, className));
    });
  }
  function descendants(el, out) {
    out = out || [];
    childrenOf(el).forEach(function (c) { out.push(c); descendants(c, out); });
    return out;
  }
  function put(obj, key, value) { if (value !== null) obj[key] = value; }

  function hotspot(el) {
    var h = {};
    put(h, "label", el.getAttribute("title"));
    h.text = el.innerHTML.replace(/\s+/g, " ").trim();
    h.names = [el.getAttribute("id")].concat(classesOf(el));
    h.hidden = el.hasAttribute("hidden");
    put(h, "note", el.getAttribute("data-note"));
    put(h, "ending", el.getAttribute("data-ending"));
    put(h, "camera", el.getAttribute("data-camera"));
    var href = el.getAttribute("href");
    if (href && href.charAt(0) === "#") h.goTo = href.slice(1);
    var minutes = el.getAttribute("data-minutes");
    if (minutes !== null) h.minutes = Number(minutes);
    return h;
  }

  function room(el) {
    var exits = [];
    kids(el, "nav").forEach(function (nav) {
      descendants(nav).forEach(function (a) {
        var href = tag(a) === "a" && a.getAttribute("href");
        if (href && href.charAt(0) === "#") exits.push(href.slice(1));
      });
    });
    var r = { name: el.getAttribute("title"), exits: exits, overlay: hasClass(el, "camera"), hotspots: {} };
    childrenOf(el).forEach(function (c) {
      if (tag(c) === "button" || tag(c) === "a") r.hotspots[c.getAttribute("id")] = hotspot(c);
    });
    return r;
  }

  function where(el, parents) {
    var inside = [];
    parents.forEach(function (p) {
      if (/^(section|article|nav)$/.test(tag(p)) && p.getAttribute("id")) inside.push(p.getAttribute("id"));
    });
    return { tag: tag(el), id: el.getAttribute("id"), classes: classesOf(el), title: el.getAttribute("title"), inside: inside };
  }

  function walk(el, parents, world) {
    childrenOf(el).forEach(function (c) {
      var inRoom = parents.some(function (p) { return tag(p) === "section" && hasClass(p, "room"); });
      if (c.getAttribute("id") || inRoom) {
        world.elements.push(where(c, parents));
      }
      walk(c, parents.concat([c]), world);
    });
  }

  L.build = function (root) {
    var world = { rooms: {}, notes: {}, endings: {}, elements: [] };
    descendants(root).forEach(function (el) {
      var id = el.getAttribute("id");
      if (tag(el) === "section" && hasClass(el, "room")) {
        world.rooms[id] = room(el);
      } else if (tag(el) === "article" && hasClass(el, "note")) {
        var h2 = kids(el, "h2")[0];
        world.notes[id] = { title: h2 ? h2.textContent : "", fake: hasClass(el, "fake"), html: el.innerHTML };
      } else if (tag(el) === "section" && hasClass(el, "ending")) {
        var h1 = kids(el, "h1")[0];
        var e = {
          title: h1 ? h1.textContent : "",
          text: el.innerHTML.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, "").trim(),
          win: hasClass(el, "win"),
        };
        put(e, "sound", el.getAttribute("data-sound"));
        world.endings[id] = e;
      }
    });
    walk(root, [], world);
    return world;
  };

  // Builds the world, sets ROOM_INFO, NOTES and ENDINGS, and (when toolbox.js is there) takes
  // rules.js's part: SETTINGS from its setup lines, EVENTS from its when() rules, and each
  // hotspot's whenClicked script.
  L.read = function (root) {
    var world = L.build(root);
    G.ROOM_INFO = world.rooms;
    G.NOTES = world.notes;
    G.ENDINGS = world.endings;
    var scripts = {};
    if (typeof Toolbox !== "undefined") {
      G.SETTINGS = Toolbox.settings();
      G.EVENTS = Toolbox.rules();
      scripts = Toolbox.clickScripts();
    }
    Object.keys(world.rooms).forEach(function (rid) {
      var spots = world.rooms[rid].hotspots;
      Object.keys(spots).forEach(function (hid) {
        spots[hid].names.forEach(function (name) {
          if (scripts[name] && !spots[hid].run) spots[hid].run = scripts[name].run;
        });
      });
    });
    return world;
  };

  return L;
})();
