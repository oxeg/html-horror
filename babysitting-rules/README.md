# The Babysitting Rules 🕯️

**Play it first!** Double-click `index.html`. It opens in your browser, and that's it.
No internet needed.

**On a phone:** open the game's web address in Chrome and turn the phone sideways. Tap
something once to look at it, tap it again to use it, and drag your finger to move the
flashlight. Tip: in Chrome's menu, choose "Add to Home screen" to get the game as an app.

Done playing? (Did you find all 10 endings?) Then read on: this whole game is made of
code, and **you can change all of it.** The missions below teach you HTML, CSS and
JavaScript, one small step at a time.

---

## What's in this folder

| File | What it is | Language |
|---|---|---|
| `index.html` | ✏️ **The story:** every room, everything you can click, the notes and the endings. | HTML |
| `style.css` | ✏️ **The look:** the colors, the letters, the notes, and where each button sits on the picture. | CSS |
| `rules.js` | ✏️ **What happens:** the scripts for the night, like the scripts in Scratch. | JavaScript |
| `sounds/` | ✏️ Put your own sound files here (see the end). | |
| `README.md` | This guide. | |
| `engine/` | The machinery: the drawings, the flashlight, the clock, the saving. You don't need to touch it. | |
| `manifest.json`, `icons/` | What a phone needs to put the game on its home screen. | |

**Golden rule:** change one small thing, save, and reload the page (press **F5**) to see it.
If something breaks, undo your last change (**Ctrl+Z**), save, and reload.

---

## When something goes wrong

The game checks your files every time it starts, and tells you what it found:

- **A black box instead of the game** means a mistake that stops the game. It names the
  file, and often the line: "**rules.js** has a mistake in it (line 57)". Open that file,
  go to that line, and look for a missing quote `"`, comma `,`, bracket `)` or `}`.
- **A small box at the bottom** is a warning: the game still works, but something looks
  wrong, like "style.css: the button #poster has no size". Read it, press OK, and fix it
  when you like.
- **A small box at the top while you play** means a script in `rules.js` tripped over
  something: "rules.js line 12: sya is not defined. Did you mean say?" The game keeps going.

Still stuck? Press **Ctrl+Shift+J** to see the browser's own message with the exact line.

## Press E: edit mode

While you're playing, press **E**. The lights come on and a panel opens:

- **Every button gets a green box with its id**, so you know what to call it.
- **Room and Time:** pick a room, type a time like `22:05`, and press Go to jump there.
- **Pointer:** shows where your mouse is on the picture, like `left: 41.2%  top: 30.5%`.
  That's how you place a new button (CSS mission 2).
- **lights out** switches the lights off and on.
- **The list of names** shows or hides things: tick `cat-outside` and the cat appears on
  the balcony.

Press **E** again to go back to playing.

---

## HTML missions

HTML is made of **tags** like `<button>` and `</button>`. A tag can have **attributes**:
`id="fridge"` is its name, `title="Fridge"` is its label. Everything between the opening
tag and the closing tag is its content.

### HTML 1: Change what something says

*You'll learn: tags, content and attributes.*

1. Open `index.html` and find the fridge:
   ```html
   <button id="fridge" title="Fridge">Milk, leftover pizza, and way too much yogurt.</button>
   ```
2. Change the words between `>` and `</button>`. They pop up when you click the fridge:
   ```html
   <button id="fridge" title="Fridge">Nothing but ketchup. Gross.</button>
   ```
3. Change the `title` too: `title="The big fridge"`. That's what you see when your light
   is on it.

**Check it:** reload, go to the living room, and click the fridge. 🎉
**If it breaks:** make sure the `"` around the title and the `</button>` at the end are
still there. `<br>` starts a new line, and `<b>bold</b>` makes words bold.

### HTML 2: Add a rule to Mom's note

*You'll learn: lists (`<ol>` and `<li>`).*

1. Find `<article class="note" id="rules">`. The rules are in an `<ol>` (an ordered list):
   each `<li>` is one rule, and the browser numbers them by itself.
2. Add a new `<li>` just before `</ol>`:
   ```html
   <li>Don't eat the last cookie. Ever.</li>
   ```

**Check it:** reload, click the note on the fridge. Your rule is number 8.
**If it breaks:** every `<li>` needs its `</li>`.

### HTML 3: Change an ending

*You'll learn: headings (`<h1>`) and paragraphs (`<p>`).*

1. The endings are at the bottom of `index.html`. Find `<section class="ending" id="mirror">`.
2. Change the words in `<h1>` (the big title) or in `<p>` (the story).

**Check it:** reload and get that ending: after 21:40, walk into the living room and click
anything there. To get there faster, press E, jump to the hallway at 21:35, press E again,
and walk to the living room.

### HTML 4: Add something you can click

*You'll learn: adding your own tag, and that HTML and CSS work together.*

1. In `index.html`, find the room `<section class="room" id="my-room" title="My room">`.
   Just before its `</section>`, add:
   ```html
   <button id="poster" title="My poster">A giant spider. You love it.</button>
   ```
2. Reload. A small box appears at the bottom: "style.css: the button #poster has no
   size". The game doesn't know where on the picture your poster goes yet.
3. Open `style.css`, find the lines under `/* My room */`, and add one more:
   ```css
   #poster { left: 47%; top: 55%; width: 10%; height: 14%; }
   ```

**Check it:** reload and go to your room. Your poster is a dashed box, because nothing is
drawn for it. Click it! (CSS missions 2 and 3 move it and make it look better.)
**If it breaks:** every `id` must be different, like sprite names in Scratch.

### HTML 5: Add a new room

*You'll learn: sections and links (`<a href>`).*

1. In `index.html`, add a new room after the hallway's `</section>`:
   ```html
   <!-- The attic -->
   <section class="room" id="attic" title="Attic">
     <nav>Go to:
       <a href="#entrance">Hallway</a>
     </nav>

     <button id="old-box" title="Old box">It's full of old photos. Who are these people?</button>
   </section>
   ```
2. In the hallway's `<nav>`, add a link to it: `<a href="#attic">Attic</a>`
3. In `style.css`, add where the box goes:
   ```css
   /* Attic */
   #old-box { left: 40%; top: 55%; width: 20%; height: 20%; }
   ```

**Check it:** reload. In the hallway there's a new **Attic** button at the bottom. Your
attic is an empty room, because nobody has drawn it yet, with your box in it.
**Good to know:** `href="#attic"` points to the room with `id="attic"`. The name on the
button at the bottom comes from the room's `title`, not from the words in the `<a>`.

---

## CSS missions

CSS says how things look. A **rule** is a selector, then `{`, then properties, then `}`:
```css
#poster { left: 47%; top: 55%; }
```
`#poster` means "the thing with `id="poster"`". `.note` means "everything with
`class="note"`". `:root` holds the colors that the whole game uses.

### CSS 1: Recolor the whole game

*You'll learn: CSS variables and color codes.*

At the top of `style.css`:
```css
--wall: #141a2e;       /* the walls */
```
Change it to `--wall: #3a1430;` for purple walls. Every room changes at once!
(Look up "color picker" to find the code for any color.)

### CSS 2: Put a button exactly where you want it

*You'll learn: positions in percent.*

1. Play, go to your room, and press **E**. Point your mouse at the top-left corner of where
   your poster should go. The panel says something like `left: 41.2%  top: 30.5%`.
2. Put those numbers in your poster's line in `style.css`. `width` and `height` are its size,
   in percent of the picture too.

**Check it:** reload, press E, and see the green box around your poster in its new place.

### CSS 3: Make your button look like something

*You'll learn: background, border and rounded corners.*

Under your poster's line in `style.css`, add:
```css
#poster { background: #5a1f2e; border: 3px solid var(--glow); border-radius: 6px; }
```
`var(--glow)` uses one of the game's colors.

**Check it:** reload. The dashed box is now a dark red poster with a golden frame.

### CSS 4: Change how the notes look

*You'll learn: fonts and turning things.*

Find `#rules` in `style.css`:
- `font-family` is the handwriting. Try `"Comic Sans MS", cursive`.
- `transform: rotate(-1deg)` tilts the note. Try `rotate(3deg)`.
- `.note { color: …; background: …; }` is the ink and the paper.

**Check it:** reload and open the Notes.

### CSS 5: A bigger or smaller flashlight

*You'll learn: one number can change how the game feels.*

In `:root` at the top of `style.css`: `--flashlight-size: 22;`. Make it `30` for an easier
night, or `15` for a really scary one.

**Check it:** play until the lights go out at 21:00 (or press E, tick "lights out", and
press E again).

---

## JavaScript missions

`rules.js` works like Scratch. A **hat block** starts a script:
```js
whenClicked("fridge", function () {
  playSound("click");
});
```
Everything between `{` and `}` runs when you click the fridge. Each line inside ends with
`;`, and the whole script ends with `});`.

### JS 1: A sound when you click

*You'll learn: hat blocks and blocks.*

At the end of `rules.js`, add:
```js
// The fridge clicks
whenClicked("fridge", function () {
  playSound("click");
});
```

**Check it:** reload and click the fridge: a click sound, and its text still pops up. (A
button's text always pops up, unless your script says something with `say`.)
The sounds you can use: `"ambient"`, `"doorbell"`, `"knock"`, `"sting"`, `"heartbeat"`,
`"meow"`, `"washer"`, `"keys"`, `"click"`.

### JS 2: A cookie counter

*You'll learn: variables, `if`/`else`, and joining text with `+`.*

```js
// Cookies on the counter
var cookies = 3;

whenClicked("counter", function () {
  if (cookies > 0) {
    cookies = cookies - 1;
    say("You eat a cookie. " + cookies + " left.");
  } else {
    say("No cookies left. Who ate them all?");
  }
});
```

**Check it:** click the kitchen counter four times.

### JS 3: Something at a time

*You'll learn: `when`, the clock's hat block.*

```js
// A message from Mom
when("19:30", function () {
  playSound("click");
  say(`Your phone buzzes. A message from Mom: "All good?"`);
});
```
Times use the 24-hour clock: `"19:30"` is half past 7 in the evening. When the text has
`"quotes"` inside, put it between backticks `` ` `` instead.

**Check it:** start a new game and press Wait twice.

### JS 4: Show and hide things

*You'll learn: `show` and `hide`.*

```js
// The coats vanish... and come back
when("19:20", function () {
  hide("coats");
  say("Wait. Where did the coats go?");
});

when("19:40", function () {
  show("coats");
});
```
Any name works: a button's id, or a name from the list in edit mode (press E).

**Check it:** start a new game, stay in the hallway and press Wait twice: the coats are gone.
Press Wait once more and they're back.

### JS 5: Different times, different words

*You'll learn: `if` with a check block.*

```js
// The sofa
whenClicked("sofa", function () {
  if (clockIsBefore("21:00")) {
    say("You flop onto the sofa. Comfy.");
  } else {
    say("Not now. Something is wrong tonight.");
  }
});
```

**Check it:** click the sofa before 21:00 and after.

### JS 6: Make your own block

*You'll learn: functions, like Scratch's "My Blocks".*

Putting your sister to bed happens in two places in `rules.js` (when you tuck her in, and
at 20:30). Both have these two lines:
```js
    hide("sister-awake", "blanket");
    show("sister-asleep");
```
1. Make your own block for it, near the top of `rules.js`:
   ```js
   // My block: put my sister to bed
   function putSisterToBed() {
     hide("sister-awake", "blanket");
     show("sister-asleep");
   }
   ```
2. In both places, replace the two lines with `putSisterToBed();`

**Check it:** tuck her in after 20:00 (she's asleep in her bed), and in a new game don't
(at 20:30 she goes to bed on her own).

### JS 7: Your own scary rule

*You'll learn: dangers, and putting HTML and JavaScript together.*

A rule needs three things: the rule on Mom's note, the danger in `rules.js`, and an ending.

1. **The note** (`index.html`, in the `<ol>`):
   ```html
   <li>If your phone gets a message from your own number, don't do what it says. Leave the room.</li>
   ```
2. **The ending** (`index.html`, next to the other endings):
   ```html
   <section class="ending" id="under-the-bed">
     <h1>Under the bed</h1>
     <p>You look under the bed. Something looks back.</p>
   </section>
   ```
3. **The rule** (`rules.js`):
   ```js
   // My rule: the message from your own number
   when("20:15", inRoom("my-room"), function () {
     playSound("sting");
     say(`Your phone buzzes. A message from YOUR number: "Look under the bed."`);
     danger({
       clicks: 3,                                        // 3 clicks to get out
       safe: leaveRoom("my-room"),
       ending: "under-the-bed",                          // too slow
       deadly: click("my-bed", { ending: "under-the-bed" }),
       whenSafe: "You don't look back.",
     });
   });
   ```

**Check it:** go to your room after 20:15. Try both: leave in time, and click your bed.
The other rules in `rules.js` show every piece a danger can have.

---

## All the blocks

| Block | What it does |
|---|---|
| `whenClicked("fridge", function () { … })` | runs when you click something (its id or class) |
| `when("21:00", function () { … })` | runs once, when the clock gets there |
| `inRoom("living")` | (inside `when`) waits until you're in that room |
| `enteringRoomWith("not-sister")` | (inside `when`) waits until you walk into a room that has it |
| `lightFinds("face", 3)` | (inside `when`) shows it, and waits until your light finds it, or 3 clicks |
| `notIn("master", "walk-in")` | (inside `when`) not while you're in one of these rooms |
| `afterRule("21:20")` | (inside `when`) only after the rule at 21:20 has happened |
| `say("Hi!")` | pops up words |
| `playSound("knock")` | plays a sound |
| `shake()` | shakes the picture |
| `show("face")`, `hide("face")` | shows or hides things by name |
| `lightsOut()`, `lightsOn()` | the lights |
| `endGame("home")` | ends the game with that ending |
| `danger({ … })` | starts a danger (see the rules at 21:20, 22:00, 22:20 and 23:00) |
| `isShown("face")` | yes if it's showing |
| `youAreIn("living")` | yes if you're in that room |
| `clockIsBefore("20:00")` | yes if it's earlier than that |
| `isDark()` | yes if the lights are out |
| `foundWithLight()` | (in a `lightFinds` rule) yes if your light found it, no if the clicks ran out |
| `startAt("19:00", "entrance")` | when and where the night starts |
| `walkingTakes(10)`, `lookingTakes(10)`, `waitingTakes(15)` | how many minutes things take |

**Pieces of a danger:** `clicks` (how many clicks you get), `safe` (what gets you safe:
`beIn("walk-in")`, `leaveRoom("living")`, `click("bath-lock")`), `ending` (when you run out of
clicks), `deadly` (what ends the game at once: `click(…)`, `anythingIn("living")`), `lasts`
and `waitEndsIt` (survive by waiting), `labels` and `buttonSays` (what things say during the
danger), `thenWait` (what you must keep doing once you're safe), `whenSafe` (what happens
when you make it).

**Two things to know:**
- Your own variables (`var cookies = 3`) start over when you reload the page, and **Try
  again** doesn't wind them back.
- When the game starts, it runs each `when()` once *pretending*, to check its danger. So if
  a `when()` changes one of your variables, that happens once at the start too.
  `whenClicked` scripts are never run pretending.

---

## Add your own sounds

The game makes its own sounds, but you can replace any of them. Put an `.mp3` file in the
`sounds/` folder with one of these names:

`ambient.mp3` (the background hum), `doorbell.mp3`, `knock.mp3`, `sting.mp3` (jump scares),
`heartbeat.mp3`, `meow.mp3`, `washer.mp3`, `keys.mp3`, `click.mp3` (the light switch)

[freesound.org](https://freesound.org) has lots of free sounds. Choose the "Creative
Commons 0" license so you're allowed to use them.

---

**Ideas to try:** a ghost in the bathroom mirror · an 11th ending · a whole new room with a
rule of its own · a different color for every room · a cat that follows you

Have fun, and don't open the door for anyone. 👀
