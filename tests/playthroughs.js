// Scripted runs through the real game. Each step is one of:
//   go <room> | click <hotspot> | wait | beam <name> | close | jump <HH:MM> <room> | flag <name> on|off
// `ending` is how the run must end. `retry` says what "Try again" must bring back
// (the danger that is running again, or null when no danger restarts).
var PLAYTHROUGHS = [
  {
    name: "W1: the whole night, played right",
    ending: "W1",
    steps: [
      "go living", "click fridge-note", "click cat-bowl", "go entrance",
      "go sister-room", "click sister-awake", "wait", "click sister-awake",
      "go entrance", "go bath", "click sink", "go entrance", "go my-room",
      "wait",
      // 21:20 rule 1: the not-sister in the hallway doorway. Hide in the walk-in.
      "go entrance", "go master-door", "click door-closed", "click walk-in-door",
      "wait", "wait", "wait",
      "go master", "go master-door",
      // 21:50 rule 6 opens the bedroom door; 22:00 rule 5: the cat outside.
      "go entrance", "wait",
      // rule 2: the reflection. Walk away.
      "go living", "go entrance",
      // 22:20 rule 3: the face. Lock the right bathroom and count.
      "go my-room", "beam face", "go entrance", "go bath", "click lock",
      "wait", "wait", "wait", "wait", "wait", "wait", "wait", "wait", "wait", "wait",
      // 22:40 rule 4a: nobody there.
      "wait", "wait", "wait",
      // 23:00 rule 7: "Mom" at the door, and the fake note.
      "wait", "go entrance", "click doorbell", "click talk", "close", "click fake-note",
      // 23:10 rule 4b: take your sister and hide.
      "wait", "go sister-room", "click sister-asleep", "go entrance", "go bath", "click lock",
      "wait", "wait",
      // 23:30: home.
      "wait",
    ],
  },
  {
    name: "E1: answering the not-sister",
    ending: "E1",
    retry: { danger: "rule1" },
    steps: ["jump 21:15 my-room", "wait", "go entrance", "click not-sister"],
  },
  {
    name: "E2: touching anything while the reflection moves",
    ending: "E2",
    retry: { danger: "rule2" },
    steps: ["jump 21:35 entrance", "wait", "go living", "click fridge"],
  },
  {
    name: "E3: going through the open bedroom door",
    ending: "E3",
    retry: { danger: null },
    steps: ["jump 21:41 master-door", "wait", "click door-open"],
  },
  {
    name: "E4: letting the cat in",
    ending: "E4",
    retry: { danger: "rule5" },
    steps: ["jump 21:59 living", "wait", "click balcony-door"],
  },
  {
    name: "E5: hiding in the washing-machine bathroom",
    ending: "E5",
    retry: { danger: "rule3" },
    steps: ["jump 22:15 my-room", "wait", "beam face", "go entrance", "go bath-washer", "click lock"],
  },
  {
    name: "E6: opening the door while counting",
    ending: "E6",
    retry: { danger: "rule3" },
    steps: [
      "jump 22:15 my-room", "wait", "beam face", "go entrance", "go bath", "click lock",
      "wait", "wait", "wait", "wait", "wait", "click lock",
    ],
  },
  {
    name: "E6-late: not hiding from the face in time",
    ending: "E6",
    retry: { danger: "rule3" },
    steps: ["jump 22:15 my-room", "wait", "beam face", "wait", "wait", "wait", "wait", "wait"],
  },
  {
    name: "E7: answering when nobody is there",
    ending: "E7",
    retry: { danger: "rule4a" },
    steps: ["jump 22:35 entrance", "wait", "click doorbell", "click talk"],
  },
  {
    name: "E8: letting 'Mom and Dad' in",
    ending: "E8",
    retry: { danger: "rule7" },
    steps: ["jump 22:55 entrance", "wait", "click doorbell", "click open"],
  },
  {
    name: "E9: hiding without your sister",
    ending: "E9",
    retry: { danger: "rule4b" },
    steps: ["jump 23:05 entrance", "wait", "go bath", "click lock"],
  },
];
