// =====================================================================
//  THE BABYSITTING RULES: the rules file
//
//  Everything that happens during the night is a script in this file,
//  like the scripts in Scratch. Each one starts with a "hat block":
//    when("21:00", function () { … });        when the clock gets to 21:00
//    when(between("21:00", "22:00"), …);      sometime between 21:00 and 22:00
//    whenClicked("toys", function () { … });  when you click the toys
//  Every new night picks new times, so the scares come in a different order.
//
//  CHEAT SHEET
//  Do:      say("Hi!")  playSound("knock")  shake()  show("face")  hide("face")
//           lightsOut()  lightsOn()  endGame("home")  danger({ … })
//  Ask:     isShown("face")  youAreIn("living")  clockIsBefore("20:00")
//           isDark()  foundWithLight()
//  Wait:    inRoom("living")             until you're in that room
//           enteringRoomWith("x")        until you walk into a room with x in it
//           lightFinds("face", 3)        until your light finds it (or 3 clicks)
//           notIn("master", "walk-in")   not while you're in one of these rooms
//           afterRule("21:10")           only after the rule that starts at 21:10
//  Random:  between("21:00", "22:00")    a new time in there every night
//           onSomeNights(9, 10)          happens on 9 nights out of 10
//  Danger:  clicks, safe, ending, deadly, lasts, waitEndsIt, labels,
//           buttonSays, thenWait, whenSafe (rules 1, 3, 5 and 7 below use them all)
//           beIn("walk-in")  leaveRoom("living")  click("bath-lock")  anythingIn("living")
//
//  Text goes between quotes "like this", or backticks `like this` when it
//  has "quotes" inside. <br> starts a new line. Press E in the game to see
//  the name of everything.
// =====================================================================

// How the night works (these are the normal values)
startAt("19:00", "entrance");   // the clock and the room at the start
walkingTakes(10);               // minutes to walk to another room
lookingTakes(10);               // minutes to look at something
waitingTakes(15);               // minutes the Wait button skips

// Mom and Dad leave
when("19:00", function () {
  say("Mom and Dad just left. The door clicks shut behind them.<br>Mom said to read the note on the fridge.");
});

// Tucking your sister in (before 8 she wants to play first)
whenClicked("sister-awake", function () {
  if (clockIsBefore("20:00")) {
    say("You play a board game with your sister. She wins. Twice.");
  } else {                          // no say() here, so her button's words in index.html pop up
    hide("sister-awake", "blanket");
    show("sister-asleep");
  }
});

// Bedtime, if you didn't tuck her in
when("20:30", function () {
  if (isShown("sister-awake")) {
    hide("sister-awake", "blanket");
    show("sister-asleep");
    say("Your sister yawns and goes to bed on her own.");
  }
});

// The lights go out
when("21:00", function () {
  lightsOut();
  playSound("click");
  say("The lights flicker and die. The switch clicks. Nothing.<br>You turn on your phone's flashlight.");
});

// The scares after dark: each one comes at a random time in its window, and on 1 night
// out of 10 it doesn't come at all. Press E in the game to see tonight's times.

// Rule 1: the not-sister in a doorway
when(between("21:10", "22:10"), onSomeNights(9, 10), enteringRoomWith("not-sister"), function () {
  show("not-sister");
  say(`Your sister is standing in the doorway. She doesn't move.<br>"Can you come here?"<br>Then it calls your name.`);
  danger({
    clicks: 6,                       // 6 clicks to get into the walk-in closet
    safe: beIn("walk-in"),
    ending: "it-wasnt-her",          // too slow, or leaving while you wait
    thenWait: {
      button: "Wait",
      steps: [
        "It calls your name.",
        { say: "Closer. It calls your name again.", show: "shadow" },
        "Right outside the door. Your name, one last time.",
      ],
      otherClicks: "Stay still. Wait until it stops.",
    },
    whenSafe: { say: "It stops. Silence.", hide: ["not-sister", "shadow"] },
  });
});

// Rule 2: the reflection in the balcony door
when(between("21:20", "22:30"), onSomeNights(9, 10), inRoom("living"), function () {
  show("reflection");
  say("In the dark glass of the balcony door, your reflection is moving.<br>You aren't.");
  danger({
    clicks: 2,                       // 2 clicks to get out of the living room
    safe: leaveRoom("living"),
    ending: "mirror",
    deadly: anythingIn("living"),    // touching anything in there
    whenSafe: { say: "You don't look back.", hide: "reflection" },
  });
});

// Rule 6: the bedroom door opens by itself
// (only after rule 1, so you can always get to the walk-in closet for rule 1;
// on a night without rule 1 it doesn't wait)
when(between("21:30", "22:30"), onSomeNights(9, 10), afterRule("21:10"), notIn("master", "walk-in"), function () {
  hide("door-closed");
  show("door-open");
});

// Rule 5: the cat on the balcony
when(between("21:35", "22:40"), onSomeNights(9, 10), function () {
  show("cat-outside");
  playSound("meow");
  if (youAreIn("living")) {
    say("The cat is outside on the balcony, scratching at the glass. Meow.");
  } else {
    say("From the living room: scratching on glass. Then a meow.");
  }
  danger({
    lasts: 3,                        // it's over after 3 clicks...
    waitEndsIt: true,                // ...or one Wait
    deadly: click("balcony-door", { ending: "not-the-cat" }),
    labels: { "balcony-door": "Open the balcony door" },
    whenSafe: { say: "The scratching stops. The balcony is empty.", hide: "cat-outside" },
  });
});

// Rule 3: the face in the window
when(between("21:40", "22:40"), onSomeNights(9, 10), lightFinds("face", 3), function () {
  show("face-close", "washer-spin", "washer-on");
  if (foundWithLight()) {
    say("A face. In the window. Looking at you.");
  } else {
    playSound("knock");
    say("Knock. Knock. A face is pressed against the window.");
  }
  danger({
    clicks: 5,
    safe: click("bath-lock"),
    ending: "sounds-like-us",
    deadly: click("laundry-lock", { ending: "spin-cycle" }),
    thenWait: {
      button: "Count",
      steps: ["10…", "20…", "30…", "40…",
        { say: `50… Knock knock knock.<br>"Sweetie, it's Dad, open up."`, sound: "knock", shake: true },
        "60…", "70…", "80…", "90…", "100."],
      labels: { "bath-lock": "Open the door" },
      otherClicks: "Keep counting...",
    },
    whenSafe: { say: "Silence. The knocking has stopped.", hide: ["face", "face-close", "washer-spin", "washer-on"] },
  });
});

// Rule 4: nobody at the doorbell
when(between("22:00", "22:50"), onSomeNights(9, 10), function () {
  show("doorbell-glow");
  playSound("doorbell");
  say("Ding-dong. The doorbell.");
  danger({
    lasts: 3,
    waitEndsIt: true,
    deadly: [click("talk", { ending: "nobody-there" }), click("open", { ending: "nobody-there" })],
    whenSafe: { say: "The doorbell stops ringing.", hide: "doorbell-glow" },
  });
});

// Rule 7: "Mom" at the door, and a note slides under it
when("23:00", function () {
  show("doorbell-glow", "feed-mom", "feet", "fake-note");
  playSound("doorbell");
  shake();
  say("Ding-dong. The doorbell again.<br>Something slides under the front door.");
  danger({
    lasts: 4,
    waitEndsIt: false,               // waiting doesn't make it stop
    deadly: click("open", { ending: "lost-keys" }),
    buttonSays: { talk: `"We lost our keys! Let us in, it's freezing!"` },
    labels: { open: "Let them in" },
    whenSafe: { say: "The doorbell stops. On the screen, the entrance is empty again.", hide: ["doorbell-glow", "feed-mom", "feet"] },
  });
});

// Rule 4 again: the camera shows the inside of the apartment
when("23:10", function () {
  show("doorbell-glow", "feed-hallway");
  say("Out in the hallway, the doorbell screen lights up. No sound.");
  danger({
    clicks: 9,
    safe: [
      click("sister-asleep", { say: "You pick your sister up. She doesn't wake.", hide: "sister-asleep", show: "bed-empty" }),
      click("lock"),                 // the lock in either bathroom (class "lock")
    ],
    ending: "forgot-her",
    deadly: click("lock"),           // locking yourself in BEFORE you have her
    labels: { "sister-asleep": "Take your sister" },
    thenWait: {
      button: "Wait",
      steps: ["The door handle turns. Click. It's locked.", "The handle turns again. Slower."],
      labels: { lock: "Open the door" },
      otherClicks: "Stay quiet. Wait.",
    },
    whenSafe: { say: "Then… silence.", hide: ["doorbell-glow", "feed-hallway"] },
  });
});

// ---- Little spooky things ----
// Some nights a few of these happen. They can't hurt you.
// Copy one, change the words and the times, and make your own!

when(between("19:20", "20:50"), onSomeNights(1, 3), function () {
  say("The fridge hums. Then it stops. The flat is very quiet.");
});

when(between("20:05", "20:55"), onSomeNights(1, 3), function () {
  playSound("click");
  say("Somewhere in the flat, a door clicks shut.");
});

when(between("21:05", "22:20"), onSomeNights(1, 3), function () {
  playSound("meow");
  say("From Mom and Dad's bedroom, a sleepy meow. The cat is in her tree house.");
});

when(between("21:15", "22:40"), onSomeNights(1, 3), function () {
  playSound("knock");
  say("Upstairs, someone knocks on the floor. Twice. Then nothing.");
});

when(between("21:45", "22:50"), onSomeNights(1, 3), function () {
  say("Your phone's flashlight flickers. Then it's fine again.");
});

when(between("22:05", "22:55"), onSomeNights(1, 3), function () {
  playSound("click");
  say("The heating pipes go tick… tick… tick. Then they stop.");
});

// Home!
when("23:30", function () {
  playSound("keys");
  say("Keys turn in the lock. The lights come back on.");
  endGame("home");
});
