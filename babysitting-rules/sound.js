// sound.js: every sound in the game, made in code (no sound files needed).
// You don't need to change this file. To use your own sound instead, put an mp3 with the
// same name in the sounds/ folder: see sounds/README.txt.
// Without audio (in Node, or before the first click) every call quietly does nothing.

var Sound = (function () {
  var S = {};
  var NAMES = ["ambient", "doorbell", "knock", "sting", "heartbeat", "meow", "washer", "keys", "click"];
  var KEY = "babysitting-rules:muted";
  var LEVEL = 0.5;        // the master volume: moderate, and the compressor squashes any peaks
  var FILE_VOLUME = 0.6;  // how loud an mp3 from sounds/ plays
  var AC = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;
  var FOLDER = soundsFolder();
  var ctx = null, master = null, noiseBuf = null;
  var files = {};         // name -> true once sounds/<name>.mp3 has loaded
  var loops = {};         // name -> the loop playing now: { stop: function, file: <audio> or null }
  var heartLevel = 0;
  var muted = readMuted();

  S.names = NAMES.slice();

  // sounds/ sits next to this file, whichever page loads it.
  function soundsFolder() {
    var me = typeof document !== "undefined" && document.currentScript;
    return (me && me.src ? me.src.replace(/[^\/]*$/, "") : "") + "sounds/";
  }

  function readMuted() {
    try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; }
  }

  // ---- the master chain: every made-up sound -> master volume -> compressor -> speakers ----

  function setup() {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : LEVEL;
    var squash = ctx.createDynamicsCompressor();
    var settings = { threshold: -18, knee: 8, ratio: 8, attack: 0.003, release: 0.25 };
    for (var k in settings) squash[k].value = settings[k];
    master.connect(squash);
    squash.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var data = noiseBuf.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    NAMES.forEach(findFile);
  }

  // Is there a sounds/<name>.mp3? A missing one just fails to load, quietly.
  // mp3s play in their own <audio>, not through Web Audio: on file:// that can come out silent.
  function findFile(name) {
    var a = new Audio();
    a.preload = "auto";
    a.oncanplaythrough = function () {
      a.oncanplaythrough = null;
      files[name] = true;
      var on = loops[name];
      if (on && !on.file) { on.stop(); loops[name] = fileLoop(name); }  // swap in the real file
    };
    a.src = FOLDER + name + ".mp3";
  }

  function playFile(name, loop) {
    var a = new Audio(FOLDER + name + ".mp3");
    a.volume = FILE_VOLUME;
    a.loop = loop;
    a.muted = muted;
    quietly(a.play());
    return a;
  }

  function fileLoop(name) {
    var a = playFile(name, true);
    if (name === "heartbeat") a.playbackRate = 1 + heartLevel;  // keeps its pitch, just faster
    return { file: a, stop: function () { a.pause(); } };
  }

  // A browser that says no to playing (or resuming) must not print an error.
  function quietly(promise) { if (promise && promise.catch) promise.catch(function () {}); }

  // ---- building blocks ----

  function gain(to, value) { var g = ctx.createGain(); g.gain.value = value || 0; g.connect(to); return g; }
  function osc(type, freq, to) { var o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; o.connect(to); return o; }
  function filter(type, freq, q, to) { var f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; f.connect(to); return f; }
  function noise(to) { var n = ctx.createBufferSource(); n.buffer = noiseBuf; n.loop = true; n.connect(to); return n; }

  // Plays from t for len seconds. Noise starts at a random spot, so no two knocks are the same.
  function run(src, t, len) { src.start(t, src.buffer ? Math.random() : 0); src.stop(t + len); }

  // Moves a setting along [seconds after t, value] points, in straight lines.
  function shape(param, t, points) {
    points.forEach(function (p, i) {
      if (i) param.linearRampToValueAtTime(p[1], t + p[0]); else param.setValueAtTime(p[1], t + p[0]);
    });
  }

  // The volume of a hit: up to peak in `rise` seconds, then fading away (fade: how slowly).
  function hit(g, t, peak, rise, fade) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + rise);
    g.gain.setTargetAtTime(0, t + rise, fade);
  }

  // A soft low thud whose pitch drops: knocks, heartbeats, the sting.
  function thump(out, t, from, to, peak, len) {
    var g = gain(out);
    var o = osc("sine", from, g);
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + len);
    hit(g, t, peak, 0.005, len / 3);
    run(o, t, len * 2.5);
  }

  // A short burst of filtered noise: wood, switches, metal.
  function tick(out, t, freq, q, peak, len) {
    var g = gain(out);
    run(noise(filter("bandpass", freq, q, g)), t, len * 2.5);
    hit(g, t, peak, 0.002, len / 3);
  }

  // A struck bell: a few soft overtones, the high ones dying first.
  function bell(out, t, freq, peak, fade) {
    [[1, 1], [2, 0.3], [3, 0.12], [4.2, 0.05]].forEach(function (p, i) {
      var g = gain(out);
      run(osc("sine", freq * p[0], g), t, fade * 8);
      hit(g, t, peak * p[1], 0.004, fade / (1 + i * 0.6));
    });
  }

  // One key hitting another: a "tsk" of bright noise and two clangy, out-of-tune
  // overtones that die almost at once (a chime rings on; keys don't).
  function clink(out, t) {
    var base = 2200 + Math.random() * 1400;
    tick(out, t, 6000 + Math.random() * 3000, 2, 0.1, 0.012);
    [[1, 0.03], [2.76, 0.018]].forEach(function (p) {
      var g = gain(out);
      run(osc("sine", base * p[0] * (0.98 + Math.random() * 0.04), g), t, 0.1);
      hit(g, t, p[1], 0.001, 0.01);
    });
  }

  // Metal sliding on metal: gritty noise through a narrow filter that slides up.
  function scrape(out, t, len) {
    var g = gain(out);
    var f = filter("bandpass", 2200, 4, g);
    shape(f.frequency, t, [[0, 2200], [len, 3600]]);
    shape(g.gain, t, [[0, 0], [0.03, 0.12], [len, 0.06], [len + 0.04, 0]]);
    var grit = osc("sawtooth", 38, gain(g.gain, 0.05));  // a rough, bumpy texture
    run(noise(f), t, len + 0.05);
    run(grit, t, len + 0.05);
  }

  // Somewhere a floorboard creaks: a slow buzz of tiny ticks through a narrow filter.
  function creak(out, t) {
    var len = 0.5 + Math.random() * 0.8;
    var g = gain(out);
    var o = osc("sawtooth", 20, filter("bandpass", 700 + Math.random() * 600, 8, g));
    shape(o.frequency, t, [[0, 16 + Math.random() * 10], [len, 30 + Math.random() * 30]]);
    shape(g.gain, t, [[0, 0], [len * 0.3, 0.5], [len, 0]]);
    run(o, t, len + 0.05);
  }

  // One heartbeat: lub-dub (the quiet octave above helps small laptop speakers).
  function beat(out, t) {
    thump(out, t, 90, 45, 0.3, 0.12);
    thump(out, t, 180, 90, 0.06, 0.08);
    thump(out, t + 0.16, 80, 40, 0.22, 0.12);
    thump(out, t + 0.16, 160, 80, 0.045, 0.08);
  }

  // ---- the sounds: play(name) plays one of these once ----

  var SOUNDS = {
    ambient: function (t) { creak(master, t); },
    heartbeat: function (t) { beat(master, t); },
    // the classic two-note doorbell: ding (higher), then dong (lower)
    doorbell: function (t) {
      bell(master, t, 660, 0.35, 0.3);
      bell(master, t + 0.6, 523, 0.35, 0.4);
    },
    // three knocks on a wooden door: a sharp knuckle "tak" and a short, hollow wooden "tok"
    knock: function (t) {
      for (var i = 0; i < 3; i++) {
        var at = t + i * 0.22 + Math.random() * 0.02;
        tick(master, at, 2400, 1.2, 0.55, 0.008);  // the knuckle
        tick(master, at, 520, 10, 1.1, 0.05);      // the wood rings for a moment
        tick(master, at, 1150, 8, 0.55, 0.03);
        thump(master, at, 160, 110, 0.2, 0.04);    // a hint of a heavy door
      }
    },
    // a jump scare: a low thud and a soft, tense chord, never louder or higher than a knock
    sting: function (t) {
      thump(master, t, 120, 40, 0.3, 0.35);
      var g = gain(master);
      var soft = filter("lowpass", 600, 0.7, g);
      [110, 116.5, 155.6].forEach(function (f) { run(osc("triangle", f, soft), t, 3); });
      shape(g.gain, t, [[0, 0], [0.08, 0.09], [0.5, 0.08]]);
      g.gain.setTargetAtTime(0, t + 0.5, 0.5);
    },
    // the cat, out on the balcony: a soft "mee-ow"
    meow: function (t) {
      var g = gain(master);
      var mouth = filter("lowpass", 700, 4, g);
      var o = osc("sawtooth", 430, mouth);
      run(osc("sine", 5.5, gain(o.frequency, 6)), t, 0.9);  // a little wobble
      shape(o.frequency, t, [[0, 430], [0.3, 600], [0.9, 450]]);
      shape(mouth.frequency, t, [[0, 700], [0.3, 1800], [0.9, 700]]);  // "mee" opens to "ow"
      shape(g.gain, t, [[0, 0], [0.12, 0.15], [0.6, 0.1], [0.9, 0]]);
      run(o, t, 0.95);
    },
    // the washing machine spins up: a rumble that thumps faster and faster, and a motor
    washer: function (t) {
      var g = gain(master);
      shape(g.gain, t, [[0, 0], [1, 1], [4.5, 1], [6, 0]]);
      var drum = gain(g, 0.5);
      var spin = osc("sine", 1.5, gain(drum.gain, 0.4));  // the drum goes round, faster and faster
      shape(spin.frequency, t, [[0, 1.5], [6, 7]]);
      var motor = osc("sawtooth", 50, filter("lowpass", 500, 1, gain(g, 0.05)));
      shape(motor.frequency, t, [[0, 50], [6, 180]]);
      [spin, motor, noise(filter("lowpass", 300, 1, drum))].forEach(function (s) { run(s, t, 6.1); });
    },
    // a bunch of keys jingling, the key slides into the lock, the pins click, the bolt goes clack
    keys: function (t) {
      for (var shake = 0; shake < 4; shake++) {
        var at = t + shake * 0.17 + Math.random() * 0.03;
        var hits = 4 + Math.floor(Math.random() * 3);
        for (var i = 0; i < hits; i++) clink(master, at + Math.random() * 0.07);
      }
      scrape(master, t + 0.85, 0.3);
      for (var p = 0; p < 3; p++) tick(master, t + 1.25 + p * 0.045, 2200 - p * 250, 3, 0.12, 0.012);
      tick(master, t + 1.42, 900, 2, 0.35, 0.03);
      thump(master, t + 1.42, 220, 90, 0.3, 0.06);
    },
    // a light switch: a small sharp snap
    click: function (t) {
      tick(master, t, 2800, 1.2, 0.3, 0.008);
      thump(master, t, 500, 200, 0.15, 0.02);
    },
  };

  // ---- loops: ambient and heartbeat play until stop(name) ----

  // A loop plays into its own volume, so stopping it fades it out. steady(out) starts the
  // parts that never stop (and returns them); tick(out) runs often to add creaks or beats.
  function makeLoop(fadeIn, steady, tick) {
    var out = gain(master);
    shape(out.gain, ctx.currentTime, [[0, 0], [fadeIn, 1]]);
    var parts = steady ? steady(out) : [];
    var timer = setInterval(function () { if (!muted) tick(out); }, 100);
    return {
      file: null,
      stop: function () {
        clearInterval(timer);
        out.gain.cancelScheduledValues(ctx.currentTime);
        out.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
        setTimeout(function () {
          parts.forEach(function (p) { p.stop(); });
          out.disconnect();
        }, 1500);
      },
    };
  }

  // A low electric hum that slowly breathes, over the quiet rumble of the building.
  function hum(out) {
    var g = gain(out, 0.045);
    var soft = filter("lowpass", 240, 0.7, g);
    var parts = [osc("sawtooth", 55, soft), osc("sawtooth", 55.4, soft), osc("triangle", 110.2, soft)];
    parts.push(osc("sine", 0.07, gain(g.gain, 0.02)));
    parts.push(noise(filter("lowpass", 350, 0.7, gain(out, 0.025))));
    parts.forEach(function (p) { p.start(); });
    return parts;
  }

  var LOOPS = {
    ambient: function () {
      var nextCreak = ctx.currentTime + 4 + Math.random() * 6;
      return makeLoop(3, hum, function (out) {
        if (ctx.currentTime < nextCreak) return;
        creak(out, ctx.currentTime + 0.05);
        nextCreak = ctx.currentTime + 6 + Math.random() * 10;
      });
    },
    heartbeat: function () {
      var next = ctx.currentTime + 0.6;  // starts just after a jump scare's thud, not on top of it
      return makeLoop(0.05, null, function (out) {
        if (next < ctx.currentTime) next = ctx.currentTime + 0.05;  // after a sleeping tab or mute
        while (next < ctx.currentTime + 0.3) {
          beat(out, next);
          next += 1 - 0.5 * heartLevel;  // 1 s between beats when calm, 0.5 s at the end
        }
      });
    },
  };

  // ---- what the game calls ----

  // Browsers only allow sound after a click, so the Start and Continue buttons call this.
  S.unlock = function () {
    if (!AC) return;
    try {
      if (!ctx) setup();
      if (ctx.state === "suspended") quietly(ctx.resume());
    } catch (e) {
      ctx = null;  // no sound on this computer: stay quiet
      AC = null;
    }
  };

  S.play = function (name) {
    if (!ctx || muted) return;
    if (files[name]) playFile(name, false);
    else if (SOUNDS[name]) SOUNDS[name](ctx.currentTime + 0.02);
  };

  S.loop = function (name) {
    if (!ctx || loops[name] || !LOOPS[name]) return;
    loops[name] = files[name] ? fileLoop(name) : LOOPS[name]();
  };

  S.stop = function (name) {
    if (loops[name]) loops[name].stop();
    delete loops[name];
  };

  // level 0..1: how close the danger is to its end. Higher is faster.
  S.setHeartRate = function (level) {
    heartLevel = Math.max(0, Math.min(1, Number(level) || 0));
    var on = loops.heartbeat;
    if (on && on.file) on.file.playbackRate = 1 + heartLevel;
  };

  S.setMuted = function (on) {
    muted = !!on;
    try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch (e) {}
    if (master) master.gain.setTargetAtTime(muted ? 0 : LEVEL, ctx.currentTime, 0.05);
    Object.keys(loops).forEach(function (n) { if (loops[n].file) loops[n].file.muted = muted; });
  };

  S.muted = function () { return muted; };

  return S;
})();
