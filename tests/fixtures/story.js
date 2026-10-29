// A tiny made-up world for the engine's unit tests. The real story is babysitting-rules/story.js.
const SISTER_NAME = "Sis";
const CAT_NAME = "Kit";

const SETTINGS = {
  startTime: "19:00",
  startRoom: "a",
  moveMinutes: 10,
  lookMinutes: 10,
  waitMinutes: 15,
  flashlightSize: 22,
};

const NOTES = {
  n1: { title: "Rules", text: "Rule one.", look: "mom" },
  fake: { title: "", text: "Let us in.", look: "fake" },
};

const ROOM_INFO = {
  a: {
    name: "Hub",
    exits: ["b", "c"],
    hotspots: {
      rug: { label: "Rug", text: "A rug.", minutes: 0 },
    },
  },
  b: {
    name: "Room B",
    exits: ["a"],
    hotspots: {
      door: { label: "Door", text: "In you go.", goTo: "closet" },
      note: { label: "Note", note: "n1" },
    },
  },
  closet: {
    name: "Closet",
    exits: ["b"],
    hotspots: {
      coat: { label: "Coat", text: "A coat." },
    },
  },
  c: {
    name: "Room C",
    exits: ["a"],
    hotspots: {
      trap: { label: "Trap", ending: "X1" },
      lamp: { label: "Lamp", text: "Click.", setFlags: ["lit"] },
      kid: { label: "Kid", text: "Goodnight.", notBefore: "19:30", tooEarly: "Too early", setFlags: ["asleep"] },
      cam: { label: "Camera", action: "camera" },
      clock: { label: "Clock", text: "Tick.", minutes: 0 },
    },
  },
  feed: {
    name: "Feed",
    overlay: true,
    exits: [],
    hotspots: {
      talk: { label: "Talk", text: "Static." },
    },
  },
};

const EVENTS = [
  { id: "e1", time: "19:20", trigger: "now", text: "E1 text", setFlags: ["x"], sound: "click" },
  { id: "e2", time: "19:20", trigger: "now", text: "E2 text" },
  { id: "bed", time: "19:40", trigger: "now", unlessFlag: "asleep", setFlags: ["asleep"], text: "Bed" },
  { id: "ghost", time: "19:50", trigger: "nextEntry", group: "ghost", setFlags: ["ghostOn"] },
  { id: "glass", time: "20:00", trigger: "inRoom", room: "c", text: "Glass", textAway: "Away" },
  { id: "stay", time: "20:00", trigger: "now", notIn: ["closet"], setFlags: ["open"] },
  { id: "meow", time: "20:05", trigger: "now", room: "c", text: "Here", textAway: "Away" },
  {
    id: "peek", time: "20:10", trigger: "beam", group: "face", armFlags: ["face"], setFlags: ["faceClose"],
    fallback: 3, fallbackText: "Knock", fallbackSound: "knock", scare: true,
  },
  {
    id: "hide", time: "20:20", trigger: "now",
    danger: {
      steps: [{ room: "b" }, { room: "closet" }],
      deadline: 4,
      late: "X2",
      fatal: [{ hotspot: "trap", ending: "X1" }],
      say: { lamp: "Not now" },
      labels: { lamp: "Run" },
      hold: {
        button: "Count",
        steps: [{ text: "1" }, { text: "2", sound: "knock", scare: true }],
        labels: { coat: "Open it" },
        fatal: "X3",
      },
      whenSafe: { text: "Safe", clearFlags: ["x"] },
    },
  },
  {
    id: "wait1", time: "20:40", trigger: "now",
    danger: { endure: 3, waitEnds: true, fatal: [{ room: "c", ending: "X1" }], whenSafe: { text: "Gone" } },
  },
  {
    id: "pick", time: "20:50", trigger: "now",
    danger: {
      steps: [{ room: "c", hotspot: "kid", setFlags: ["carry"] }, { room: ["b", "closet"] }],
      deadline: 7,
      late: "X2",
      fatal: [{ hotspot: "door", unlessFlag: "carry", ending: "X3" }],
    },
  },
  {
    id: "leaveC", time: "20:55", trigger: "now", room: "c",
    danger: { steps: [{ leave: "c" }], deadline: 2, late: "X2" },
  },
  { id: "home", time: "21:00", trigger: "now", ending: "WIN" },
];

const ENDINGS = {
  X1: { title: "X1", text: "Ending one." },
  X2: { title: "X2", text: "Ending two." },
  X3: { title: "X3", text: "Ending three." },
  WIN: { title: "Win", text: "You made it.", win: true },
};
