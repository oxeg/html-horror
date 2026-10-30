// Scripted runs through the real game. Each step is one of:
//   go <room> | click <hotspot> | wait | beam <name> | close | jump <HH:MM> <room> | show <name> on|off
// `ending` is how the run must end. `retry` says what "Try again" must bring back
// (the danger that is running again, by its rule's id: the rule's first time; or null when no
// danger restarts). A click on a button you can't see stops the run. They all play the classic
// night (classicNight() in game.test.js), so the times in the comments are the scares' times.
var PLAYTHROUGHS = [
  {
    name: "W1: the whole night, played right",
    ending: "home",
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
      "go my-room", "beam face", "go entrance", "go bath", "click bath-lock",
      "wait", "wait", "wait", "wait", "wait", "wait", "wait", "wait", "wait", "wait",
      // 22:40 rule 4a: nobody there.
      "wait", "wait", "wait",
      // 23:00 rule 7: "Mom" at the door, and the fake note.
      "wait", "go entrance", "click doorbell", "click talk", "close", "click fake-note",
      // 23:10 rule 4b: take your sister and hide.
      "wait", "go sister-room", "click sister-asleep", "go entrance", "go bath", "click bath-lock",
      "wait", "wait",
      // 23:30: home.
      "wait",
    ],
  },
  {
    name: "E1: answering the not-sister",
    ending: "it-wasnt-her",
    retry: { danger: "21:10" },
    steps: ["jump 21:15 my-room", "wait", "go entrance", "click hall-not-sister"],
  },
  {
    name: "E2: touching anything while the reflection moves",
    ending: "mirror",
    retry: { danger: "21:20" },
    steps: ["jump 21:35 entrance", "wait", "go living", "click fridge"],
  },
  {
    name: "E3: going through the open bedroom door",
    ending: "open-door",
    retry: { danger: null },
    steps: ["jump 21:41 master-door", "wait", "click door-open"],
  },
  {
    name: "E4: letting the cat in",
    ending: "not-the-cat",
    retry: { danger: "21:35" },
    steps: ["jump 21:59 living", "wait", "click balcony-door"],
  },
  {
    name: "E5: hiding in the washing-machine bathroom",
    ending: "spin-cycle",
    retry: { danger: "21:40" },
    steps: ["jump 22:15 my-room", "wait", "beam face", "go entrance", "go bath-washer", "click laundry-lock"],
  },
  {
    name: "E6: opening the door while counting",
    ending: "sounds-like-us",
    retry: { danger: "21:40" },
    steps: [
      "jump 22:15 my-room", "wait", "beam face", "go entrance", "go bath", "click bath-lock",
      "wait", "wait", "wait", "wait", "wait", "click bath-lock",
    ],
  },
  {
    name: "E6-late: not hiding from the face in time",
    ending: "sounds-like-us",
    retry: { danger: "21:40" },
    steps: ["jump 22:15 my-room", "wait", "beam face", "wait", "wait", "wait", "wait", "wait"],
  },
  {
    name: "E7: answering when nobody is there",
    ending: "nobody-there",
    retry: { danger: "22:00" },
    steps: ["jump 22:35 entrance", "wait", "click doorbell", "click talk"],
  },
  {
    name: "E8: letting 'Mom and Dad' in",
    ending: "lost-keys",
    retry: { danger: "23:00" },
    steps: ["jump 22:55 entrance", "wait", "click doorbell", "click open"],
  },
  {
    name: "E9: hiding without your sister",
    ending: "forgot-her",
    retry: { danger: "23:10" },
    steps: ["jump 23:05 entrance", "wait", "go bath", "click bath-lock"],
  },
];
