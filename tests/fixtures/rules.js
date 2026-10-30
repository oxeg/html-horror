// The night in the fixture world (tests/fixtures/index.html), written with the same blocks as
// babysitting-rules/rules.js. It's one function so a test can write it again: world() in
// tests/unit/check.test.js builds a small world, then puts this one back.
function fixtureRules() {
  startAt("19:00", "a");
  walkingTakes(10);
  lookingTakes(10);
  waitingTakes(15);

  // The lamp lights up when you click it.
  whenClicked("lamp", function () { show("lit"); });

  // The kid won't go to sleep before 19:30.
  whenClicked("kid", function () {
    if (clockIsBefore("19:30")) {
      say("Too early");
    } else {
      show("asleep");
    }
  });

  when("19:20", function () {
    show("x");
    lightsOut();
    playSound("click");
    say("E1 text");
  });

  when("19:20", function () { say("E2 text"); });

  // Only once the ghost (19:50) has come.
  when("19:30", afterRule("19:50"), function () { show("lateOn"); });

  // Bedtime, unless the kid is asleep already.
  when("19:40", function () {
    if (!isShown("asleep")) {
      show("asleep");
      say("Bed");
    }
  });

  when("19:50", enteringRoomWith("ghost"), notIn("closet"), function () { show("ghost"); });

  when("20:00", inRoom("c"), function () { say("Glass"); });

  when("20:00", notIn("closet"), function () { show("open"); });

  when("20:05", function () { say(youAreIn("c") ? "Here" : "Away"); });

  when("20:10", lightFinds("face", 3), function () {
    show("face-close");
    shake();
    if (!foundWithLight()) {
      playSound("knock");
      say("Knock");
    }
  });

  // Get to the closet through b, then count.
  when("20:20", function () {
    danger({
      clicks: 4,
      safe: [beIn("b"), beIn("closet")],
      ending: "X2",
      deadly: click("trap", { ending: "X1" }),
      buttonSays: { lamp: "Not now" },
      labels: { lamp: "Run" },
      thenWait: {
        button: "Count",
        steps: ["1", { say: "2", sound: "knock", shake: true }],
        labels: { coat: "Open it" },
        otherClicks: "Keep counting",
        ending: "X3",
      },
      whenSafe: { say: "Safe", hide: "x" },
    });
  });

  // Sit it out: three clicks or one Wait, and touch nothing in c.
  when("20:40", function () {
    danger({ lasts: 3, waitEndsIt: true, ending: "X1", deadly: anythingIn("c"), whenSafe: "Gone" });
  });

  // Pick up the kid, then get to b or the closet. The door is deadly before you have the kid;
  // with the kid, walking into b ends the danger before you can click it.
  when("20:50", function () {
    danger({
      clicks: 7,
      safe: [click("kid", { show: "carry" }), beIn(["b", "closet"])],
      ending: "X2",
      deadly: [click("door", { ending: "X3" }), click("kid", { ending: "X1" })],
    });
  });

  when("20:55", function () { danger({ clicks: 2, safe: leaveRoom("c"), ending: "X2" }); });

  when("21:00", function () { endGame("WIN"); });
}

fixtureRules();
