// The plain room: just walls, ceiling and floor (copied from the living room), with nothing in it.
// A room in index.html that has no drawing of its own gets this one, and each of its buttons gets
// a box you can see, so you can try a new room before you draw it.
ROOMS["plain"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- the room: back wall, ceiling, floor and the two side walls -->
  <rect width="1600" height="900" fill="var(--wall)"/>
  <polygon points="0,0 1600,0 1200,160 400,160" fill="var(--void)" opacity="0.55"/>
  <polygon points="0,900 1600,900 1200,640 400,640" fill="var(--void)" opacity="0.4"/>
  <polygon points="0,0 400,160 400,640 0,900" fill="var(--void)" opacity="0.25"/>
  <polygon points="1600,0 1200,160 1200,640 1600,900" fill="var(--void)" opacity="0.25"/>
</svg>`;
