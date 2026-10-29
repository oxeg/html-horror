// Stub drawing for "entrance": plain boxes with the right ids, until the real art replaces it.
ROOMS["entrance"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect width="1600" height="900" fill="var(--wall)"/>
  <g data-hotspot="front-door"><rect x="200" y="120" width="200" height="160" fill="var(--furniture)"/><text x="210" y="150" fill="var(--glow)" font-size="22">front-door</text></g>
  <g data-hotspot="doorbell"><rect x="450" y="120" width="200" height="160" fill="var(--furniture)"/><text x="460" y="150" fill="var(--glow)" font-size="22">doorbell</text></g>
  <g data-hotspot="light-switch"><rect x="700" y="120" width="200" height="160" fill="var(--furniture)"/><text x="710" y="150" fill="var(--glow)" font-size="22">light-switch</text></g>
  <g data-hotspot="coats"><rect x="950" y="120" width="200" height="160" fill="var(--furniture)"/><text x="960" y="150" fill="var(--glow)" font-size="22">coats</text></g>
  <g data-hotspot="fake-note" data-show-if="fakeNote"><rect x="1200" y="120" width="200" height="160" fill="var(--furniture)"/><text x="1210" y="150" fill="var(--glow)" font-size="22">fake-note</text></g>
  <g data-hotspot="not-sister" data-show-if="notSister"><rect x="200" y="340" width="200" height="160" fill="var(--furniture)"/><text x="210" y="370" fill="var(--glow)" font-size="22">not-sister</text></g>
  <g data-name="lamp-glow" data-hide-if="dark"><rect x="450" y="340" width="200" height="160" fill="var(--furniture)"/><text x="460" y="370" fill="var(--glow)" font-size="22">lamp-glow</text></g>
  <g data-name="doorbell-glow" data-show-if="ringing"><rect x="700" y="340" width="200" height="160" fill="var(--furniture)"/><text x="710" y="370" fill="var(--glow)" font-size="22">doorbell-glow</text></g>
</svg>`;
