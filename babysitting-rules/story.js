// =====================================================================
//  THE BABYSITTING RULES: the story file
//
//  This file has how the night works and the scary events.
//  The rooms, the things you can click, the notes and the endings are
//  in index.html.
//
//  A few tips:
//  - Text goes between quotes "like this", or backticks `like this`
//    when it has "quotes" inside.
//  - Every line inside a list ends with a comma.
//  - <br> starts a new line. <b>words</b> makes words bold.
//  - If you make a typo, the game shows a message telling you which
//    file is broken. Undo your last change and try again.
//  - Press E in the game to see every clickable thing and its name.
// =====================================================================

// ---------------------------------------------------------------------
//  SETTINGS: how the night works
// ---------------------------------------------------------------------
const SETTINGS = {
  startTime: "19:00",     // the clock when the game starts
  startRoom: "entrance",  // where you are at the start
  moveMinutes: 10,        // minutes it takes to walk to another room
  lookMinutes: 10,        // minutes it takes to look at something
  waitMinutes: 15,        // minutes the Wait button skips
  flashlightSize: 22,     // how big your phone light is (percent of the screen width)
};

// ---------------------------------------------------------------------
//  EVENTS: what happens during the night, in time order.
//
//  time:    when it happens ("21:20" means 9:20 in the evening)
//  trigger: "now"       = as soon as the clock gets there
//           "nextEntry" = the next time you walk into a room that has the
//                         drawing named in group
//           "inRoom"    = when you are in (or walk into) the room named in room
//           "beam"      = when your flashlight finds the drawing named in group
//  text:    what pops up.  sound: a sound to play
//  show / hide: things to show or hide, by their names, like ["cat-outside"]
//  lightsOut: true = the lights go out (and you need your flashlight)
//  unlessShown: skip the event if that thing is already showing
//  after:   the id of another event that has to happen first
//
//  A danger is the scary part. You have a few clicks (the deadline) to do
//  the right thing (the steps). Clicking something in fatal ends the game.
//  hold is what you have to keep doing once you're safe (Wait, or Count).
//  During a hold, leaving (or clicking what its labels name, like the door) ends the game;
//  clicking anything else just shows its keep text.
//  whenSafe is what happens when you make it. A step's then is what happens when you do it.
//  An ending is named by its id in index.html, like "mirror" for <section class="ending" id="mirror">.
// ---------------------------------------------------------------------
const EVENTS = [
  {
    id: "intro", time: "19:00", trigger: "now",
    text: "Mom and Dad just left. The door clicks shut behind them.<br>Mom said to read the note on the fridge.",
  },
  {
    id: "bedtime", time: "20:30", trigger: "now", unlessShown: "sister-asleep",
    hide: ["sister-awake", "blanket"], show: ["sister-asleep"],
    text: "Your sister yawns and goes to bed on her own.",
  },
  {
    id: "lightsOut", time: "21:00", trigger: "now", lightsOut: true, sound: "click",
    text: "The lights flicker and die. The switch clicks. Nothing.<br>You turn on your phone's flashlight.",
  },

  // Rule 1: the not-sister in a doorway
  {
    id: "rule1", time: "21:20", trigger: "nextEntry", group: "not-sister", show: ["not-sister"],
    text: `Your sister is standing in the doorway. She doesn't move.<br>"Can you come here?"<br>Then it calls your name.`,
    danger: {
      steps: [{ room: "walk-in" }],
      deadline: 6,
      late: "it-wasnt-her",
      hold: {
        button: "Wait",
        steps: [
          { text: "It calls your name." },
          { text: "Closer. It calls your name again.", show: ["shadow"] },
          { text: "Right outside the door. Your name, one last time." },
        ],
        keep: "Stay still. Wait until it stops.",
        fatal: "it-wasnt-her",
      },
      whenSafe: { text: "It stops. Silence.", hide: ["not-sister", "shadow"] },
    },
  },

  // Rule 2: the reflection in the balcony door
  {
    id: "rule2", time: "21:40", trigger: "inRoom", room: "living", show: ["reflection"],
    text: "In the dark glass of the balcony door, your reflection is moving.<br>You aren't.",
    danger: {
      steps: [{ leave: "living" }],
      deadline: 2,
      late: "mirror",
      fatal: [{ room: "living", ending: "mirror" }],
      whenSafe: { text: "You don't look back.", hide: ["reflection"] },
    },
  },

  // Rule 6: the bedroom door opens by itself
  // (after: "rule1" means it waits until rule 1 has happened, so you can always reach the walk-in for rule 1)
  { id: "rule6", time: "21:50", trigger: "now", after: "rule1", notIn: ["master", "walk-in"], hide: ["door-closed"], show: ["door-open"] },

  // Rule 5: the cat on the balcony
  {
    id: "rule5", time: "22:00", trigger: "now", room: "living", show: ["cat-outside"], sound: "meow",
    text: "The cat is outside on the balcony, scratching at the glass. Meow.",
    textAway: "From the living room: scratching on glass. Then a meow.",
    danger: {
      endure: 3,
      waitEnds: true,
      fatal: [{ hotspot: "balcony-door", ending: "not-the-cat" }],
      labels: { "balcony-door": "Open the balcony door" },
      whenSafe: { text: "The scratching stops. The balcony is empty.", hide: ["cat-outside"] },
    },
  },

  // Rule 3: the face in the window
  {
    id: "rule3", time: "22:20", trigger: "beam", group: "face",
    armShow: ["face"], show: ["face-close", "washer-spin", "washer-on"],
    text: "A face. In the window. Looking at you.",
    fallback: 3,
    fallbackText: "Knock. Knock. A face is pressed against the window.",
    fallbackSound: "knock",
    danger: {
      steps: [{ room: "bath", hotspot: "lock" }],
      deadline: 5,
      late: "sounds-like-us",
      fatal: [{ room: "bath-washer", hotspot: "lock", ending: "spin-cycle" }],
      hold: {
        button: "Count",
        steps: [
          { text: "10…" },
          { text: "20…" },
          { text: "30…" },
          { text: "40…" },
          { text: `50… Knock knock knock.<br>"Sweetie, it's Dad, open up."`, sound: "knock", shake: true },
          { text: "60…" },
          { text: "70…" },
          { text: "80…" },
          { text: "90…" },
          { text: "100." },
        ],
        labels: { lock: "Open the door" },
        keep: "Keep counting...",
        fatal: "sounds-like-us",
      },
      whenSafe: { text: "Silence. The knocking has stopped.", hide: ["face", "face-close", "washer-spin", "washer-on"] },
    },
  },

  // Rule 4: nobody at the doorbell
  {
    id: "rule4a", time: "22:40", trigger: "now", show: ["doorbell-glow"], sound: "doorbell",
    text: "Ding-dong. The doorbell.",
    danger: {
      endure: 3,
      waitEnds: true,
      fatal: [{ hotspot: "talk", ending: "nobody-there" }, { hotspot: "open", ending: "nobody-there" }],
      whenSafe: { text: "The doorbell stops ringing.", hide: ["doorbell-glow"] },
    },
  },

  // Rule 7: "Mom" at the door, and a note slides under it
  {
    id: "rule7", time: "23:00", trigger: "now", show: ["doorbell-glow", "feed-mom", "feet", "fake-note"], sound: "doorbell", scare: true,
    text: "Ding-dong. The doorbell again.<br>Something slides under the front door.",
    danger: {
      endure: 4,
      waitEnds: false,
      fatal: [{ hotspot: "open", ending: "lost-keys" }],
      say: { talk: `"We lost our keys! Let us in, it's freezing!"` },
      labels: { open: "Let them in" },
      whenSafe: { text: "The doorbell stops. On the screen, the entrance is empty again.", hide: ["doorbell-glow", "feed-mom", "feet"] },
    },
  },

  // Rule 4 again: the camera shows the inside of the apartment
  {
    id: "rule4b", time: "23:10", trigger: "now", show: ["doorbell-glow", "feed-hallway"],
    text: "Out in the hallway, the doorbell screen lights up. No sound.",
    danger: {
      steps: [
        {
          room: "sister-room", hotspot: "sister-asleep",
          then: { text: "You pick your sister up. She doesn't wake.", hide: ["sister-asleep"], show: ["bed-empty"] },
        },
        { room: ["bath", "bath-washer"], hotspot: "lock" },
      ],
      deadline: 9,
      late: "forgot-her",
      fatal: [{ hotspot: "lock", unlessShown: "bed-empty", ending: "forgot-her" }],
      labels: { "sister-asleep": "Take your sister" },
      hold: {
        button: "Wait",
        steps: [
          { text: "The door handle turns. Click. It's locked." },
          { text: "The handle turns again. Slower." },
        ],
        labels: { lock: "Open the door" },
        keep: "Stay quiet. Wait.",
        fatal: "forgot-her",
      },
      whenSafe: { text: "Then… silence.", hide: ["doorbell-glow", "feed-hallway"] },
    },
  },

  // Home!
  {
    id: "home", time: "23:30", trigger: "now", ending: "home", sound: "keys",
    text: "Keys turn in the lock. The lights come back on.",
  },
];
