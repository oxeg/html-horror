// =====================================================================
//  THE BABYSITTING RULES: the story file
//
//  Everything you can see or read in the game lives in this file:
//  the names, the rules, what happens when you click things, the scary
//  events, and the endings. Change anything you like!
//
//  A few tips:
//  - Text goes between quotes "like this" or backticks `like this`.
//    Backticks let you use the names: `You tuck ${SISTER_NAME} in.`
//  - Every line inside a list ends with a comma.
//  - <br> starts a new line. <b>words</b> makes words bold.
//  - If you make a typo, the game shows a message telling you which
//    file is broken. Undo your last change and try again.
//  - Press E in the game to see every clickable thing and its name.
// =====================================================================

// ✏️ How the game talks about your sister and the cat.
// Put their real names here, like "Mia" and "Whiskers", and the whole story uses them!
// (The game makes the first letter big by itself when a sentence starts with one.)
const SISTER_NAME = "your sister";
const CAT_NAME = "the cat";

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
//  NOTES: the notes you can find. The "look" picks the handwriting.
// ---------------------------------------------------------------------
const NOTES = {
  fridge: {
    title: "Rules for tonight",
    look: "mom",
    text: `<b>Rules for tonight</b>, Mom & Dad<br><br>
1. By 8:30 ${SISTER_NAME} is asleep, and she doesn't wake up until morning. If she's standing in a doorway after 9, it isn't her. Don't answer when it calls your name. Go to our walk-in closet and wait until it stops.<br>
2. After dark, the balcony door is a mirror. If your reflection moves when you don't, walk away slowly and don't look back until you're in another room.<br>
3. If you see a face in the window, lock yourself in the bathroom <b>without</b> the washing machine and count to 100. Don't open the door for anyone, even if they sound like us.<br>
4. If the doorbell rings, check the camera first. If no one is there, don't answer. If the camera shows the inside of our apartment, take ${SISTER_NAME} and hide.<br>
5. The cat is never allowed on the balcony. If you see her out there, don't let her in. Check her tree house in our bedroom first.<br>
6. Keep our bedroom door closed. If you find it open, don't go in, not even to hide.<br>
7. We're home at 11:30. We have keys. We will <b>never</b> ring the doorbell.<br><br>
Love you! ❤️`,
  },
  fake: {
    title: "Note from under the door",
    look: "fake",
    text: `The note on the fridge isn't from us. Rule 7 is wrong, we lost our keys!<br>
Let us in. Your sister is fine. Hurry.<br>
Mom & Dad`,
  },
};

// ---------------------------------------------------------------------
//  ROOM_INFO: every room, where you can walk from it, and the things
//  you can click in it.
//
//  name:     what the button at the bottom says
//  exits:    the rooms you can walk to from here
//  hotspots: the clickable things. Each one needs a shape with the same
//            name in the room's drawing, like data-hotspot="fridge"
//            in rooms/living.js.
//
//  A clickable thing can have:
//    label:  the words you see when your light is on it
//    text:   what pops up when you click it
//    goTo:   a room it takes you to
//    note:   a note it lets you read
//    ending: an ending it causes (careful!)
//    setFlags: switches it turns on, like ["sisterAsleep"]
//    minutes:  how long it takes (instead of lookMinutes)
//    notBefore + tooEarly: it only works after that time
// ---------------------------------------------------------------------
const ROOM_INFO = {
  entrance: {
    name: "Hallway",
    exits: ["living", "my-room", "sister-room", "bath", "bath-washer", "master-door"],
    hotspots: {
      "front-door": { label: "Front door", text: "Locked. Mom and Dad have their keys." },
      "doorbell": { label: "Doorbell screen", action: "camera" },
      "light-switch": { label: "Light switch", text: "Click. Click." },
      "coats": { label: "Coat hooks", text: "Mom's red coat is gone. So is Dad's." },
      "fake-note": { label: "A note under the door", note: "fake" },
      "not-sister": { label: `${SISTER_NAME}?`, ending: "E1" },
    },
  },
  living: {
    name: "Living room",
    exits: ["entrance"],
    hotspots: {
      "fridge": { label: "Fridge", text: "Milk, leftover pizza, and way too much yogurt." },
      "fridge-note": { label: "Note on the fridge", note: "fridge" },
      "counter": { label: "Kitchen counter", text: "Crumbs. Somebody had cookies." },
      "sofa": { label: "Sofa", text: "The remote is stuck between the cushions again." },
      "cat-bowl": { label: "Cat bowl", text: `You fill ${CAT_NAME}'s bowl. She's asleep in her tree house and doesn't come.` },
      "window": { label: "Window", text: "The city lights, far away." },
      "balcony-door": { label: "Balcony door", text: "Locked. It's cold out there, and there's no balcony light." },
      "reflection": { label: "Your reflection", ending: "E2" },
      "cat-outside": { label: `${CAT_NAME}?`, text: "She stares at you through the glass. Her eyes shine in your light." },
      "not-sister": { label: `${SISTER_NAME}?`, ending: "E1" },
    },
  },
  "my-room": {
    name: "My room",
    exits: ["entrance"],
    hotspots: {
      "bed": { label: "My bed", text: "Not sleepy. Not yet." },
      "desk": { label: "Desk", text: "Homework. It can wait until tomorrow." },
      "posters": { label: "Posters", text: "Your favorite book covers. The scary ones." },
      "window": { label: "Window", text: "Other buildings, other windows. Most of them are dark." },
      "not-sister": { label: `${SISTER_NAME}?`, ending: "E1" },
    },
  },
  "sister-room": {
    name: `${SISTER_NAME}'s room`,
    exits: ["entrance"],
    hotspots: {
      "sister-awake": {
        label: SISTER_NAME,
        text: `You tuck ${SISTER_NAME} in. "Night night." She's asleep in seconds.`,
        setFlags: ["sisterAsleep"],
        notBefore: "20:00",
        tooEarly: `You play a board game with ${SISTER_NAME}. She wins. Twice.`,
      },
      "sister-asleep": { label: `${SISTER_NAME} (asleep)`, text: `${SISTER_NAME} is fast asleep.` },
      "toys": { label: "Toys", text: "A pile of stuffed animals. One of them is missing an eye." },
      "night-light": { label: "Night-light", text: "A little moon. It keeps the monsters away. Supposedly." },
      "window": { label: "Window", text: "Just the dark, and your own face in the glass." },
    },
  },
  "master-door": {
    name: "Parents' door",
    exits: ["entrance"],
    hotspots: {
      "door-closed": { label: "Parents' bedroom", text: "You slip inside.", goTo: "master" },
      "door-open": { label: "Go in", ending: "E3" },
      "not-sister": { label: `${SISTER_NAME}?`, ending: "E1" },
    },
  },
  master: {
    name: "Parents' bedroom",
    exits: ["master-door"],
    hotspots: {
      "bed": { label: "Big bed", text: "Neatly made. Mom always makes it." },
      "tree-house": { label: `${CAT_NAME}'s tree house`, text: `${CAT_NAME} is curled up inside, fast asleep.` },
      "walk-in-door": { label: "Walk-in closet", text: "You step into the closet.", goTo: "walk-in" },
      "window": { label: "Window", text: "No curtains. Just glass, and the night." },
    },
  },
  "walk-in": {
    name: "Walk-in closet",
    exits: ["master"],
    hotspots: {
      "clothes": { label: "Clothes", text: "Mom's dresses. Dad's shirts. They smell like home." },
      "door-light": { label: "Light under the door", text: "A thin line of light from the bedroom." },
    },
  },
  "bath-washer": {
    name: "Bathroom (laundry)",
    exits: ["entrance"],
    hotspots: {
      "sink": { label: "Sink", text: "You brush your teeth. Minty." },
      "mirror": { label: "Mirror", text: "Just you. Good." },
      "shower": { label: "Shower", text: "Drip. Drip. Drip." },
      "washer": { label: "Washing machine", text: "Its round window stares at you like a big glass eye." },
      "lock": { label: "Lock the door", text: "Click. Locked." },
    },
  },
  bath: {
    name: "Bathroom",
    exits: ["entrance"],
    hotspots: {
      "sink": { label: "Sink", text: "You brush your teeth. Minty." },
      "mirror": { label: "Mirror", text: "Just you. Good." },
      "shower": { label: "Shower", text: "Drip. Drip. Drip." },
      "basket": { label: "Laundry basket", text: "Socks. So many socks." },
      "lock": { label: "Lock the door", text: "Click. Locked." },
    },
  },
  // The doorbell's camera. It's not a room you walk into: it opens on top of the hallway.
  "doorbell-camera": {
    name: "Doorbell camera",
    overlay: true,
    exits: [],
    hotspots: {
      "talk": { label: "Talk", text: "Static. Nobody's there." },
      "open": { label: "Open the building door", text: "You open the door downstairs. Nobody comes in." },
    },
  },
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
//  setFlags / clearFlags: switches to turn on or off
//
//  A danger is the scary part. You have a few clicks (the deadline) to do
//  the right thing (the steps). Clicking something in fatal ends the game.
//  hold is what you have to keep doing once you're safe (Wait, or Count).
//  whenSafe is what happens when you make it.
// ---------------------------------------------------------------------
const EVENTS = [
  {
    id: "intro", time: "19:00", trigger: "now",
    text: "Mom and Dad just left. The door clicks shut behind them.<br>Mom said to read the note on the fridge.",
  },
  {
    id: "bedtime", time: "20:30", trigger: "now", unlessFlag: "sisterAsleep", setFlags: ["sisterAsleep"],
    text: `${SISTER_NAME} yawns and goes to bed on her own.`,
  },
  {
    id: "lightsOut", time: "21:00", trigger: "now", setFlags: ["dark"], sound: "click",
    text: "The lights flicker and die. The switch clicks. Nothing.<br>You turn on your phone's flashlight.",
  },

  // Rule 1: the not-sister in a doorway
  {
    id: "rule1", time: "21:20", trigger: "nextEntry", group: "not-sister", setFlags: ["notSister"],
    text: `${SISTER_NAME} is standing in the doorway. She doesn't move.<br>"Can you come here?"<br>Then it calls your name.`,
    danger: {
      steps: [{ room: "walk-in" }],
      deadline: 6,
      late: "E1",
      hold: {
        button: "Wait",
        steps: [
          { text: "It calls your name." },
          { text: "Closer. It calls your name again.", setFlags: ["shadow"] },
          { text: "Right outside the door. Your name, one last time." },
        ],
        fatal: "E1",
      },
      whenSafe: { text: "It stops. Silence.", clearFlags: ["notSister", "shadow"] },
    },
  },

  // Rule 2: the reflection in the balcony door
  {
    id: "rule2", time: "21:40", trigger: "inRoom", room: "living", setFlags: ["reflection"],
    text: "In the dark glass of the balcony door, your reflection is moving.<br>You aren't.",
    danger: {
      steps: [{ leave: "living" }],
      deadline: 2,
      late: "E2",
      fatal: [{ room: "living", ending: "E2" }],
      whenSafe: { text: "You don't look back.", clearFlags: ["reflection"] },
    },
  },

  // Rule 6: the bedroom door opens by itself
  { id: "rule6", time: "21:50", trigger: "now", notIn: ["master", "walk-in"], setFlags: ["masterOpen"] },

  // Rule 5: the cat on the balcony
  {
    id: "rule5", time: "22:00", trigger: "now", room: "living", setFlags: ["catOutside"], sound: "meow",
    text: `${CAT_NAME} is outside on the balcony, scratching at the glass. Meow.`,
    textAway: "From the living room: scratching on glass. Then a meow.",
    danger: {
      endure: 3,
      waitEnds: true,
      fatal: [{ hotspot: "balcony-door", ending: "E4" }],
      labels: { "balcony-door": "Open the balcony door" },
      whenSafe: { text: "The scratching stops. The balcony is empty.", clearFlags: ["catOutside"] },
    },
  },

  // Rule 3: the face in the window
  {
    id: "rule3", time: "22:20", trigger: "beam", group: "face",
    armFlags: ["face"], setFlags: ["faceClose", "washerSpin"],
    text: "A face. In the window. Looking at you.",
    fallback: 3,
    fallbackText: "Knock. Knock. A face is pressed against the window.",
    fallbackSound: "knock",
    danger: {
      steps: [{ room: "bath", hotspot: "lock" }],
      deadline: 5,
      late: "E6",
      fatal: [{ room: "bath-washer", hotspot: "lock", ending: "E5" }],
      hold: {
        button: "Count",
        steps: [
          { text: "10…" },
          { text: "20…" },
          { text: "30…" },
          { text: "40…" },
          { text: `50… Knock knock knock.<br>"Sweetie, it's Dad, open up."`, sound: "knock", scare: true },
          { text: "60…" },
          { text: "70…" },
          { text: "80…" },
          { text: "90…" },
          { text: "100." },
        ],
        labels: { lock: "Open the door" },
        fatal: "E6",
      },
      whenSafe: { text: "Silence. The knocking has stopped.", clearFlags: ["face", "faceClose", "washerSpin"] },
    },
  },

  // Rule 4: nobody at the doorbell
  {
    id: "rule4a", time: "22:40", trigger: "now", setFlags: ["ringing"], sound: "doorbell",
    text: "Ding-dong. The doorbell.",
    danger: {
      endure: 3,
      waitEnds: true,
      fatal: [{ hotspot: "talk", ending: "E7" }, { hotspot: "open", ending: "E7" }],
      whenSafe: { text: "The doorbell stops ringing.", clearFlags: ["ringing"] },
    },
  },

  // Rule 7: "Mom" at the door, and a note slides under it
  {
    id: "rule7", time: "23:00", trigger: "now", setFlags: ["ringing", "feedMom", "fakeNote"], sound: "doorbell", scare: true,
    text: "Ding-dong. The doorbell again.<br>Something slides under the front door.",
    danger: {
      endure: 4,
      waitEnds: false,
      fatal: [{ hotspot: "open", ending: "E8" }],
      say: { talk: `"We lost our keys! Let us in, it's freezing!"` },
      labels: { open: "Let them in" },
      whenSafe: { text: "The doorbell stops. On the screen, the entrance is empty again.", clearFlags: ["ringing", "feedMom"] },
    },
  },

  // Rule 4 again: the camera shows the inside of the apartment
  {
    id: "rule4b", time: "23:10", trigger: "now", setFlags: ["ringing", "feedHallway"],
    text: "Out in the hallway, the doorbell screen lights up. No sound.",
    danger: {
      steps: [
        { room: "sister-room", hotspot: "sister-asleep", setFlags: ["sisterWithYou"], text: `You pick ${SISTER_NAME} up. She doesn't wake.` },
        { room: ["bath", "bath-washer"], hotspot: "lock" },
      ],
      deadline: 9,
      late: "E9",
      fatal: [{ hotspot: "lock", unlessFlag: "sisterWithYou", ending: "E9" }],
      labels: { "sister-asleep": `Take ${SISTER_NAME}` },
      hold: {
        button: "Wait",
        steps: [
          { text: "The door handle turns. Click. It's locked." },
          { text: "The handle turns again. Slower." },
        ],
        fatal: "E9",
      },
      whenSafe: { text: "Then… silence.", clearFlags: ["ringing", "feedHallway"] },
    },
  },

  // Home!
  {
    id: "home", time: "23:30", trigger: "now", ending: "W1", sound: "keys",
    text: "Keys turn in the lock. The lights come back on.",
  },
];

// ---------------------------------------------------------------------
//  ENDINGS: there are 10 to find. W1 is the good one.
// ---------------------------------------------------------------------
const ENDINGS = {
  E1: {
    title: "It wasn't her",
    text: `You walk to the doorway. It smiles at you. Its smile is too wide.<br>In her room, ${SISTER_NAME} is still fast asleep.`,
  },
  E2: {
    title: "Mirror",
    text: "You stare. Your reflection stops pretending and puts its hand on the glass.<br>From the inside.",
  },
  E3: {
    title: "The open door",
    text: "The bedroom is dark. Something on the bed sits up.",
  },
  E4: {
    title: "Not the cat",
    text: "It slips inside. It walks on two legs.",
  },
  E5: {
    title: "Spin cycle",
    text: "The washing machine starts by itself. Click. The lock turns the wrong way.",
    sound: "washer",
  },
  E6: {
    title: "Sounds like us",
    text: "You open the door. Dad is there. Dad doesn't blink.",
  },
  E7: {
    title: "Nobody there",
    text: `"Hello?" The empty screen answers in your own voice.`,
  },
  E8: {
    title: "We lost our keys",
    text: `You let them in. Footsteps climb the stairs. Many more than two.<br>Real Mom always signs her notes "Love you!"…`,
  },
  E9: {
    title: "You forgot her",
    text: `You lock the door. From the hallway, ${SISTER_NAME} asks why you left her.`,
  },
  W1: {
    title: "Home at 11:30",
    win: true,
    text: `Keys in the lock. Mom and Dad, the real ones. Mom asks how ${CAT_NAME} was.<br>
You check on ${SISTER_NAME}. She half-wakes and mumbles:<br>
<i>"Who were you talking to all night? I was asleep."</i><br><br><b>THE END?</b>`,
  },
};
