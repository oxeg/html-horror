// Stub drawing for "master-door": plain boxes with the right ids, until the real art replaces it.
ROOMS["master-door"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect width="1600" height="900" fill="var(--wall)"/>
  <g data-hotspot="door-closed" data-hide-if="masterOpen"><rect x="200" y="120" width="200" height="160" fill="var(--furniture)"/><text x="210" y="150" fill="var(--glow)" font-size="22">door-closed</text></g>
  <g data-hotspot="door-open" data-show-if="masterOpen"><rect x="450" y="120" width="200" height="160" fill="var(--furniture)"/><text x="460" y="150" fill="var(--glow)" font-size="22">door-open</text></g>
  <g data-hotspot="not-sister" data-show-if="notSister"><rect x="700" y="120" width="200" height="160" fill="var(--furniture)"/><text x="710" y="150" fill="var(--glow)" font-size="22">not-sister</text></g>
</svg>`;
