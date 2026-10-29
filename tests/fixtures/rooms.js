// Bare-bones drawings for the fixture world: just the attributes the engine looks for.
ROOMS.a = `<svg viewBox="0 0 1600 900"><rect data-hotspot="rug" x="200" y="200" width="100" height="100"/></svg>`;
ROOMS.b = `<svg viewBox="0 0 1600 900">
  <rect data-hotspot="door" x="200" y="200" width="100" height="100"/>
  <rect data-hotspot="note" x="400" y="200" width="100" height="100"/>
  <g data-name="ghost" data-show-if="ghostOn"><rect x="600" y="200" width="100" height="100"/></g>
</svg>`;
ROOMS.closet = `<svg viewBox="0 0 1600 900"><rect data-hotspot="coat" x="200" y="200" width="100" height="100"/></svg>`;
ROOMS.c = `<svg viewBox="0 0 1600 900">
  <rect data-hotspot="trap" x="200" y="200" width="100" height="100"/>
  <rect data-hotspot="lamp" x="400" y="200" width="100" height="100"/>
  <rect data-hotspot="kid" x="600" y="200" width="100" height="100"/>
  <rect data-hotspot="cam" x="800" y="200" width="100" height="100"/>
  <g data-name="face" data-show-if="face"><rect x="1000" y="200" width="100" height="100"/></g>
</svg>`;
ROOMS.feed = `<svg viewBox="0 0 1600 900"><rect data-hotspot="talk" x="200" y="200" width="100" height="100"/></svg>`;
ROOMS.title = `<svg viewBox="0 0 1600 900"><rect data-name="lit-window" x="200" y="200" width="100" height="100"/></svg>`;
