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

const EVENTS = [];

const ENDINGS = {
  X1: { title: "X1", text: "Ending one." },
  X2: { title: "X2", text: "Ending two." },
  X3: { title: "X3", text: "Ending three." },
  WIN: { title: "Win", text: "You made it.", win: true },
};
