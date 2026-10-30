// errors.js: if a game file has a mistake in it or is missing, this shows a message in plain words
// instead of a blank page. It loads first, so it hears about every file after it. When the page has
// loaded and nothing is wrong, it starts the game.
// You don't need to change this file.

var ROOMS = {};  // the drawings: each file in engine/drawings/ adds one

(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;  // Node: no page

  var me = document.currentScript;
  var errors = [];   // every mistake the browser reported while the page loaded: { message, file, line, script }
  var missing = [];  // the <script> tags whose file isn't there
  var loaded = [];   // the <script> tags that finished loading
  var UNZIP = "If you opened this from a zip file, extract (unzip) the whole folder first, then open index.html inside it.";

  function drawingOf(src) {
    var m = /(?:^|\/)drawings\/([^\/]+)\.js$/.exec(src || "");
    return m ? m[1] : null;
  }

  // The script that was running when a mistake happened: document.currentScript, or else (Chrome may
  // hide it when the page is opened from a file) the first script tag in the page that hasn't
  // finished loading. They run one after the other, so that's the one.
  function runningScript() {
    if (document.currentScript) return document.currentScript;
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i];
      if (s.getAttribute("src") && !drawingOf(s.getAttribute("src")) && loaded.indexOf(s) < 0 && missing.indexOf(s) < 0) return s;
    }
    return null;
  }

  window.onerror = function (message, file, line) {
    errors.push({ message: String(message || ""), file: file || "", line: line || 0, script: runningScript() });
  };
  // A file that isn't there: its <script> tag gets an error event (and never a load event).
  document.addEventListener("error", function (e) {
    if (e.target && e.target.tagName === "SCRIPT") missing.push(e.target);
  }, true);
  document.addEventListener("load", function (e) {
    if (e.target && e.target.tagName === "SCRIPT") loaded.push(e.target);
  }, true);

  // errors.js is here, so the game files aren't all missing: the message in index.html can go.
  // (It goes for good once the game starts, or this file shows its own message.)
  var unzip = document.getElementById("unzip");
  if (unzip) unzip.style.display = "none";

  function removeUnzip() {
    var box = document.getElementById("unzip");
    if (box) box.parentNode.removeChild(box);
  }

  // Works even if the style sheets are missing, so it never lands on a blank or messy page.
  function styleBox(box, css) { box.style.cssText = css; }

  function showProblem(title, lines) {
    var box = document.getElementById("problem");
    if (!box) {
      box = document.createElement("div");
      box.id = "problem";
      document.body.appendChild(box);
    }
    var html = "<h2 style='color:#ffb4b4;font-weight:400'>" + title + "</h2>";
    for (var i = 0; i < lines.length; i++) html += "<p>" + lines[i] + "</p>";
    box.innerHTML = html;
    box.className = "on";
    styleBox(box, "display:block;position:fixed;top:0;left:0;right:0;bottom:0;z-index:999;background:#000;color:#fff;padding:8vh 10vw;overflow:auto;font:18px/1.5 system-ui,sans-serif");
    removeUnzip();
  }

  function showWarnings(warnings) {
    var note = document.createElement("div");
    note.id = "warnings";
    styleBox(note, "position:fixed;z-index:90;bottom:8px;left:8px;padding:8px 12px;font:13px system-ui,sans-serif;background:#222;color:#fff;border:1px solid #666;border-radius:8px");
    note.innerHTML = warnings.join("<br>") + " <button>OK</button>";
    note.getElementsByTagName("button")[0].onclick = function () { note.remove(); };
    document.body.appendChild(note);
  }

  // Does this file define what it should? One that stopped halfway leaves its part undefined.
  // (A const that was never reached still exists but throws when touched, so a throw means "no".)
  function registered(src) {
    try { return isRegistered(src); } catch (e) { return false; }
  }
  function isRegistered(src) {
    var drawing = drawingOf(src);
    if (drawing) return typeof ROOMS[drawing] === "string";
    var file = src.split("?")[0].split("/").pop();
    if (file === "engine.js") return typeof Game !== "undefined";
    if (file === "save.js") return typeof Game !== "undefined" && typeof Game.continueGame === "function";
    if (file === "toolbox.js") return typeof Toolbox !== "undefined";
    if (file === "loader.js") return typeof Loader !== "undefined";
    if (file === "check.js") return typeof Check !== "undefined";
    if (file === "view.js") return typeof View !== "undefined";
    if (file === "sound.js") return typeof Sound !== "undefined";
    if (file === "editmode.js") return typeof EditMode !== "undefined";
    // rules.js (and errors.js): a mistake in it is an error the browser reported, below.
    return true;
  }

  // The script tag a mistake was in: the one the browser named, else the one that was running.
  function scriptOf(e, scripts) {
    for (var i = 0; i < scripts.length; i++) {
      if (e.file && scripts[i].src === e.file) return scripts[i];
    }
    return e.script;
  }

  // "Script error." is all Chrome may say when the page is opened from a file: no use to show.
  function browserSays(e) {
    return /^script error\.?$/i.test(e.message) ? [] : ["The browser says: " + e.message];
  }

  // Every script after this one (the drawings after the others), what's wrong with each, and the
  // mistakes that don't belong to any of them. Shows a message and says true if anything is wrong.
  function shownProblems() {
    var all = [].slice.call(document.getElementsByTagName("script")).filter(function (s) {
      return s !== me && s.getAttribute("src");
    });
    var scripts = all.filter(function (s) { return !drawingOf(s.getAttribute("src")); })
      .concat(all.filter(function (s) { return drawingOf(s.getAttribute("src")); }));
    var noDrawing = (typeof Loader !== "undefined" && Loader.missingDrawings) || {};
    var lines = [];
    var broken = 0;
    var mistakes = 0;  // files with a mistake in them (not missing): the browser's console shows the line
    var mine = errors.map(function (e) { return scriptOf(e, scripts); });
    var stray = errors.filter(function (e, i) { return scripts.indexOf(mine[i]) < 0; });
    scripts.forEach(function (s) {
      var src = s.getAttribute("src");
      if (noDrawing[drawingOf(src)]) return;  // a room with no drawing of its own gets the plain one
      var its = errors.filter(function (e, i) { return mine[i] === s; });
      if (missing.indexOf(s) >= 0) {
        broken++;
        lines.push("<b>" + src + "</b> is missing.");
      } else if (its.length || !registered(src)) {
        broken++;
        mistakes++;
        var line = its.filter(function (e) { return e.line; }).map(function (e) { return e.line; })[0];
        lines.push("<b>" + src + "</b> has a mistake in it" + (line ? " (line " + line + ")" : "") + ".");
        its.forEach(function (e) { lines = lines.concat(browserSays(e)); });
      }
    });
    if (scripts.length && broken === scripts.length) {
      showProblem("The other game files are missing.", [UNZIP]);
      return true;
    }
    if (stray.length) {
      mistakes++;
      lines.push("Something went wrong while the game was loading.");
      stray.forEach(function (e) { lines = lines.concat(browserSays(e)); });
    }
    if (!lines.length) return false;
    if (mistakes) lines.push("Press Ctrl+Shift+J to see the exact line.");
    showProblem("Something is wrong", lines);
    return true;
  }

  // "Fix it in index.html, then reload the page.": the files the check's messages start with.
  function fixIn(messages) {
    var files = [];
    messages.forEach(function (m) {
      var file = /^([\w.\/-]+\.(?:html|js|css))/.exec(m);
      if (file && files.indexOf(file[1]) < 0) files.push(file[1]);
    });
    return files.length ? "Fix it in " + files.join(" and ") + ", then reload the page." : "Fix it, then reload the page.";
  }

  function startGame() {
    Loader.read(document.body);  // the rooms, notes and endings in index.html
    var found = Check.run();
    if (found.errors.length) {
      showProblem("The story has a mistake", found.errors.concat([fixIn(found.errors)]));
      return;
    }
    var warnings = found.warnings;
    if (Check.layout) warnings = warnings.concat(Check.layout().warnings);  // where the buttons sit
    if (warnings.length) showWarnings(warnings);
    document.body.classList.add("ready");
    View.boot();
    removeUnzip();
  }

  window.addEventListener("load", function () {
    try {
      if (!shownProblems()) startGame();
    } catch (e) {
      showProblem("Something is wrong", [e.message, "Press Ctrl+Shift+J to see the exact line."]);
    }
  });
})();
