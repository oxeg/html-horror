// Stub drawing for "living": plain boxes with the right ids, until the real art replaces it.
ROOMS["living"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect width="1600" height="900" fill="var(--wall)"/>
  <g data-hotspot="fridge"><rect x="200" y="120" width="200" height="160" fill="var(--furniture)"/><text x="210" y="150" fill="var(--glow)" font-size="22">fridge</text></g>
  <g data-hotspot="fridge-note"><rect x="450" y="120" width="200" height="160" fill="var(--furniture)"/><text x="460" y="150" fill="var(--glow)" font-size="22">fridge-note</text></g>
  <g data-hotspot="counter"><rect x="700" y="120" width="200" height="160" fill="var(--furniture)"/><text x="710" y="150" fill="var(--glow)" font-size="22">counter</text></g>
  <g data-hotspot="sofa"><rect x="950" y="120" width="200" height="160" fill="var(--furniture)"/><text x="960" y="150" fill="var(--glow)" font-size="22">sofa</text></g>
  <g data-hotspot="cat-bowl"><rect x="1200" y="120" width="200" height="160" fill="var(--furniture)"/><text x="1210" y="150" fill="var(--glow)" font-size="22">cat-bowl</text></g>
  <g data-hotspot="window"><rect x="200" y="340" width="200" height="160" fill="var(--furniture)"/><text x="210" y="370" fill="var(--glow)" font-size="22">window</text></g>
  <g data-hotspot="balcony-door"><rect x="450" y="340" width="200" height="160" fill="var(--furniture)"/><text x="460" y="370" fill="var(--glow)" font-size="22">balcony-door</text></g>
  <g data-hotspot="reflection" data-show-if="reflection"><rect x="700" y="340" width="200" height="160" fill="var(--furniture)"/><text x="710" y="370" fill="var(--glow)" font-size="22">reflection</text></g>
  <g data-hotspot="cat-outside" data-show-if="catOutside"><rect x="950" y="340" width="200" height="160" fill="var(--furniture)"/><text x="960" y="370" fill="var(--glow)" font-size="22">cat-outside</text></g>
  <g data-hotspot="not-sister" data-show-if="notSister"><rect x="1200" y="340" width="200" height="160" fill="var(--furniture)"/><text x="1210" y="370" fill="var(--glow)" font-size="22">not-sister</text></g>
  <g data-name="face" data-show-if="face"><rect x="200" y="560" width="200" height="160" fill="var(--furniture)"/><text x="210" y="590" fill="var(--glow)" font-size="22">face</text></g>
  <g data-name="face-close" data-show-if="faceClose" data-scare><rect x="450" y="560" width="200" height="160" fill="var(--furniture)"/><text x="460" y="590" fill="var(--glow)" font-size="22">face-close</text></g>
  <g data-name="lamp-glow" data-hide-if="dark"><rect x="700" y="560" width="200" height="160" fill="var(--furniture)"/><text x="710" y="590" fill="var(--glow)" font-size="22">lamp-glow</text></g>
</svg>`;
