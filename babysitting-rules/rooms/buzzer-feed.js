// Stub drawing for "buzzer-feed": plain boxes with the right ids, until the real art replaces it.
ROOMS["buzzer-feed"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect width="1600" height="900" fill="var(--wall)"/>
  <g data-hotspot="talk"><rect x="200" y="120" width="200" height="160" fill="var(--furniture)"/><text x="210" y="150" fill="var(--glow)" font-size="22">talk</text></g>
  <g data-hotspot="open"><rect x="450" y="120" width="200" height="160" fill="var(--furniture)"/><text x="460" y="150" fill="var(--glow)" font-size="22">open</text></g>
  <g data-name="feed-empty" data-hide-if="feedMom feedHallway"><rect x="700" y="120" width="200" height="160" fill="var(--furniture)"/><text x="710" y="150" fill="var(--glow)" font-size="22">feed-empty</text></g>
  <g data-name="feed-mom" data-show-if="feedMom"><rect x="950" y="120" width="200" height="160" fill="var(--furniture)"/><text x="960" y="150" fill="var(--glow)" font-size="22">feed-mom</text></g>
  <g data-name="feed-hallway" data-show-if="feedHallway"><rect x="1200" y="120" width="200" height="160" fill="var(--furniture)"/><rect data-name="figure" data-scare x="1270" y="140" width="60" height="120" fill="var(--skin)"/><text x="1210" y="150" fill="var(--glow)" font-size="22">feed-hallway</text></g>
</svg>`;
