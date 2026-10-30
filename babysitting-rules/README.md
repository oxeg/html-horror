# The Babysitting Rules 🕯️

**Play it first!** Double-click `index.html`. It opens in your browser, and that's it.
No internet needed.

**On a phone:** open the game's web address in Chrome and turn the phone sideways. Tap
something once to look at it, tap it again to use it, and drag your finger to move the
flashlight. Tip: in Chrome's menu, choose "Add to Home screen" to get the game as an app.

Done playing? (Did you find all 10 endings?) Then read on: this whole game is made of
code, and **you can change all of it.**

---

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | The page you open. It loads everything else. |
| `story.js` | ✏️ **The story.** Every text, every room, every scary event, every ending. Start here! |
| `style.css` | ✏️ The colors, the look of the buttons, and where each thing you can click sits on the picture. |
| `rooms/` | ✏️ One drawing per room. They're made of shapes (SVG), not pictures. |
| `sounds/` | ✏️ Put your own sound files here (see below). |
| `engine.js`, `save.js`, `view.js`, `check.js`, `sound.js`, `editmode.js` | The machinery. You don't need to touch these. |

**Golden rule:** change one small thing, save, and reload the page (press F5) to see it.
If something breaks, undo your last change (Ctrl+Z) and save again.

---

## Change a text

Open `story.js` and find the text you want to change. For example, the fridge in the
living room:

```js
"fridge": { label: "Fridge", text: "Milk, leftover pizza, and way too much yogurt." },
```

`label` is what you see when your light is on it. `text` is what pops up when you click it.
Change the words between the quotes:

```js
"fridge": { label: "Fridge", text: "Nothing but ketchup. Gross." },
```

Save, reload, click the fridge. 🎉

Tips:
- Keep the quotes and the comma at the end.
- Text between backticks (`` ` ``) can use the names: `` `You tuck ${SISTER_NAME} in.` ``
- `<br>` starts a new line. `<b>bold</b>` makes words bold.

## Change the names

At the very top of `story.js`:

```js
const SISTER_NAME = "your sister";
const CAT_NAME = "the cat";
```

Put real names in instead, like `"Mia"` and `"Whiskers"` (keep the quotes!), save, reload,
and the whole story uses them. Don't worry about capital letters: the game makes the
first letter big by itself when a sentence starts with a name.

## Change when something happens

Everything scary is in the `EVENTS` list in `story.js`. Each event has a `time`:

```js
id: "lightsOut", time: "21:00", trigger: "now", lightsOut: true, sound: "click",
```

Change `"21:00"` to `"20:45"` and the lights go out earlier! (Times use the 24-hour
clock: `"21:00"` is 9 in the evening.) The events must stay in time order, from earliest
to latest. If you want an event to happen much earlier, move it up the list too, or the
game will tell you they're out of order.

You can also make the night faster or slower at the top, in `SETTINGS`:

```js
moveMinutes: 10,        // minutes it takes to walk to another room
waitMinutes: 15,        // minutes the Wait button skips
flashlightSize: 22,     // how big your phone light is
```

## Recolor the whole game

Open `style.css`. At the top are the colors every room uses:

```css
--void: #07070d;       /* almost black */
--wall: #141a2e;       /* the walls */
--furniture: #232a45;  /* furniture */
--accent: #3b3560;     /* edges and handles */
--glow: #e8c27a;       /* lamp light */
--danger: #7a0d18;     /* the red when something is wrong */
--skin: #b9c4b0;       /* faces and creatures */
```

Change one, like `--wall: #3a1430;` for purple walls, save and reload. Every room changes
at once. (Look up "color picker" to find the code for any color.)

## Press E: edit mode

While you're playing, press **E**. The lights come on, every clickable thing gets a green
box with its id, and a panel lets you:

- jump to any room and any time (type a time like `22:05`, then press Go)
- show or hide things by their names: tick `cat-outside` and the cat appears on the
  balcony, tick `door-open` (and untick `door-closed`) and the bedroom door opens, tick
  `lights out` and the lamps go off.

Press **E** again to go back to playing.

## Add something you can click

Say you want a poster in your room that you can click.

**1. Add a button.** In `index.html`, find `<section class="room" id="my-room"` and add
a line inside it. `title` is the name you see when your light is on it, and the words
inside pop up when you click it:

```html
<button id="poster" title="My new poster">A giant spider. You love it.</button>
```

**2. Put it on the picture.** In `style.css`, next to the other "My room" lines:

```css
#poster { left: 62.5%; top: 26.7%; width: 6.9%; height: 15.6%; }
```

`left` and `top` say where its top-left corner goes, `width` and `height` how big it is,
all in % of the picture. Until you draw it, it shows as a dashed box.

**3. Draw it.** Open `rooms/my-room.js`. Find a good spot (inside the `<svg ...>` and
before the last `</svg>`), and add a shape with the same name in `data-name`:

```html
<!-- my new poster -->
<g data-name="poster">
  <rect x="1000" y="240" width="110" height="140" fill="var(--accent)"/>
</g>
```

The drawing is 1600 wide and 900 tall. `x` and `y` say where the top-left corner goes,
`width` and `height` how big it is. Use the color names from `style.css`.

Save the files and reload. Press E to check that your poster has a green box.

## Add a new room

**1.** Make a new file `rooms/attic.js` (copy another room file and change it):

```js
ROOMS["attic"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect width="1600" height="900" fill="var(--wall)"/>
  <g data-name="old-box">
    <rect x="700" y="500" width="200" height="140" fill="var(--furniture)"/>
  </g>
</svg>`;
```

**2.** In `index.html`, add a line next to the other rooms:

```html
<script src="rooms/attic.js"></script>
```

**3.** In `index.html`, add the room next to the other rooms, and put its button on the
picture in `style.css`:

```html
<section class="room" id="attic" title="Attic">
  <nav>Go to: <a href="#entrance">Hallway</a></nav>
  <button id="old-box" title="Old box">It's full of old photos. Who are these people?</button>
</section>
```

```css
#old-box { left: 43.8%; top: 55.6%; width: 12.5%; height: 15.6%; }
```

**4.** Add `<a href="#attic">Attic</a>` to the `<nav>` of a room you want to reach it
from, for example the hallway's (`entrance`). Save, reload, and there's a new button at
the bottom!

## When something goes wrong

If you see a black screen with a message instead of the game, the game is telling you
which file has a mistake, and often the line number. Most mistakes are:

- a missing quote `"` or backtick `` ` ``
- a missing comma `,` at the end of a line inside a list
- a name in `story.js` that doesn't match a button's id in `index.html` or a
  `data-name="..."` in the drawing

Undo your last change, or press **Ctrl+Shift+J** to see the exact line.

## Add your own sounds

The game makes its own sounds, but you can replace any of them. Put an `.mp3` file in the
`sounds/` folder with one of these names:

`ambient.mp3` (the background hum), `doorbell.mp3`, `knock.mp3`, `sting.mp3` (jump scares),
`heartbeat.mp3`, `meow.mp3`, `washer.mp3`, `keys.mp3`, `click.mp3` (the light switch)

[freesound.org](https://freesound.org) has lots of free sounds. Choose the "Creative
Commons 0" license so you're allowed to use them.

---

**Ideas to try:** a new rule on the fridge note · a ghost in the bathroom mirror ·
an 11th ending · a whole new room · a different color for every room

Have fun, and don't open the door for anyone. 👀
