// Builder-only, migration-only: the old story.js ids and their new names. port.js and the
// migration tests use it; it's the one place these pairs are written down. Task 14 deletes it.
// A renamed hotspot keeps its old id as its class. Every id not listed here stays the same.
var RENAMES = {
  endings: {
    E1: "it-wasnt-her",
    E2: "mirror",
    E3: "open-door",
    E4: "not-the-cat",
    E5: "spin-cycle",
    E6: "sounds-like-us",
    E7: "nobody-there",
    E8: "lost-keys",
    E9: "forgot-her",
    W1: "home",
  },
  notes: {
    fridge: "rules",
    fake: "door-note",
  },
  // per room: old hotspot id → new id
  hotspots: {
    entrance: { "not-sister": "hall-not-sister" },
    living: { window: "living-window", "not-sister": "living-not-sister" },
    "my-room": { bed: "my-bed", window: "my-window", "not-sister": "my-not-sister" },
    "sister-room": { window: "sister-window" },
    "master-door": { "not-sister": "door-not-sister" },
    master: { bed: "big-bed", window: "master-window" },
    "bath-washer": { sink: "laundry-sink", mirror: "laundry-mirror", shower: "laundry-shower", lock: "laundry-lock" },
    bath: { sink: "bath-sink", mirror: "bath-mirror", shower: "bath-shower", lock: "bath-lock" },
  },
  // old event id → the new rule's id (its time)
  rules: {
    intro: "19:00",
    bedtime: "20:30",
    lightsOut: "21:00",
    rule1: "21:20",
    rule2: "21:40",
    rule6: "21:50",
    rule5: "22:00",
    rule3: "22:20",
    rule4a: "22:40",
    rule7: "23:00",
    rule4b: "23:10",
    home: "23:30",
  },
};
