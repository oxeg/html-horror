// sound.js: in Node there is no audio at all, so every call must quietly do nothing.

test("Sound lists the nine names", function () {
  eq(Sound.names, ["ambient", "doorbell", "knock", "sting", "heartbeat", "meow", "washer", "keys", "click"]);
});

test("calls are safe without audio", function () {
  Sound.play("knock");
  Sound.play("nope");
  Sound.loop("ambient");
  Sound.setMuted(true);
  ok(Sound.muted() === true, "muted after setMuted(true)");
});
