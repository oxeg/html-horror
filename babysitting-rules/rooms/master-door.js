// The end of the hallway, in front of Mom and Dad's bedroom door. Rule 6 says: if you find
// this door open, DON'T go in. A doorway on the right leads back toward the front door.
// Clickable things have data-hotspot="...", the same names as in story.js.
ROOMS["master-door"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="master-door-lamp-light">
      <stop offset="0" style="stop-color: var(--glow)" stop-opacity="0.5"/>
      <stop offset="1" style="stop-color: var(--glow)" stop-opacity="0"/>
    </radialGradient>
    <path id="master-door-heart" d="M0,14 C-6,10 -20,2 -20,-8 C-20,-16 -10,-20 0,-10 C10,-20 20,-16 20,-8 C20,2 6,10 0,14 Z"/>
  </defs>

  <!-- the room: back wall, ceiling, floor and the two side walls -->
  <rect width="1600" height="900" fill="var(--wall)"/>
  <polygon points="0,0 1600,0 1200,160 400,160" fill="var(--void)" opacity="0.55"/>
  <polygon points="0,900 1600,900 1200,640 400,640" fill="var(--void)" opacity="0.4"/>
  <polygon points="0,0 400,160 400,640 0,900" fill="var(--void)" opacity="0.25"/>
  <polygon points="1600,0 1200,160 1200,640 1600,900" fill="var(--void)" opacity="0.25"/>
  <!-- ceiling light, and the long rug down the hallway -->
  <ellipse cx="800" cy="104" rx="56" ry="13" fill="var(--furniture)"/>
  <ellipse cx="800" cy="100" rx="38" ry="6" fill="var(--accent)" opacity="0.5"/>
  <polygon points="716,652 884,652 952,770 648,770" fill="var(--accent)" opacity="0.3"/>
  <polygon points="726,662 874,662 932,760 668,760" fill="var(--void)" opacity="0.15"/>

  <!-- pictures on the left wall: a painting of the sea, and a little one of the cat -->
  <polygon points="190,272 300,284 300,413 190,426" fill="var(--furniture)"/>
  <polygon points="198,283 292,292 292,405 198,415" fill="var(--accent)" opacity="0.45"/>
  <polygon points="198,370 292,368 292,405 198,415" fill="var(--void)" opacity="0.4"/>
  <polygon points="226,372 236,330 248,370" fill="var(--glow)" opacity="0.25"/>
  <polygon points="190,468 300,448 300,518 190,552" fill="var(--furniture)"/>
  <polygon points="198,474 292,455 292,514 198,543" fill="var(--accent)" opacity="0.45"/>
  <circle cx="246" cy="500" r="12" fill="var(--void)" opacity="0.5"/>
  <polygon points="236,492 238,478 246,488" fill="var(--void)" opacity="0.5"/>
  <polygon points="256,492 254,478 246,488" fill="var(--void)" opacity="0.5"/>

  <!-- the doorway back to the hall (right wall) -->
  <polygon points="1462,166 1288,204 1288,712 1462,812" fill="var(--furniture)"/>
  <polygon points="1450,172 1300,208 1300,705 1450,802" fill="var(--void)"/>

  <!-- the not-sister, standing in that doorway. Too still. -->
  <g data-hotspot="not-sister" data-show-if="notSister">
    <rect x="1326" y="450" width="96" height="300" fill="var(--void)" opacity="0"/>
    <path d="M1408,472 Q1406,438 1374,436 Q1342,438 1340,472 L1338,520 L1410,520 Z" fill="var(--void)"/>
    <ellipse cx="1374" cy="482" rx="28" ry="33" fill="var(--skin)"/>
    <ellipse cx="1385" cy="480" rx="4" ry="6" fill="var(--void)"/>
    <ellipse cx="1363" cy="480" rx="4" ry="6" fill="var(--void)"/>
    <polygon points="1400,520 1348,520 1330,672 1418,672" fill="var(--skin)" opacity="0.6"/>
    <rect x="1403" y="526" width="11" height="110" rx="5" fill="var(--skin)" opacity="0.85"/>
    <rect x="1334" y="526" width="11" height="110" rx="5" fill="var(--skin)" opacity="0.85"/>
    <rect x="1381" y="670" width="13" height="72" fill="var(--skin)" opacity="0.85"/>
    <rect x="1354" y="670" width="13" height="74" fill="var(--skin)" opacity="0.85"/>
  </g>

  <!-- a painting over the hall table -->
  <rect x="452" y="262" width="136" height="104" fill="var(--furniture)"/>
  <rect x="462" y="272" width="116" height="84" fill="var(--accent)" opacity="0.45"/>
  <polygon points="462,356 500,310 530,340 552,318 578,346 578,356" fill="var(--void)" opacity="0.4"/>
  <circle cx="552" cy="294" r="9" fill="var(--glow)" opacity="0.35"/>

  <!-- the hall table with a lamp, and its light while the lights still work -->
  <g data-name="lamp-glow" data-hide-if="dark">
    <circle cx="520" cy="470" r="190" fill="url(#master-door-lamp-light)"/>
    <ellipse cx="520" cy="664" rx="140" ry="24" fill="var(--glow)" opacity="0.1"/>
  </g>
  <rect x="446" y="530" width="8" height="112" fill="var(--furniture)"/>
  <rect x="586" y="530" width="8" height="112" fill="var(--furniture)"/>
  <rect x="446" y="600" width="148" height="6" fill="var(--furniture)"/>
  <rect x="436" y="520" width="168" height="10" fill="var(--accent)"/>
  <ellipse cx="520" cy="518" rx="18" ry="5" fill="var(--furniture)"/>
  <rect x="517" y="474" width="6" height="44" fill="var(--furniture)"/>
  <polygon points="492,436 548,436 564,480 476,480" fill="var(--accent)"/>
  <rect x="560" y="506" width="22" height="14" rx="3" fill="var(--furniture)"/>
  <rect x="462" y="584" width="40" height="16" rx="3" fill="var(--accent)" opacity="0.6"/>

  <!-- the bedroom door, closed, with the heart sign we made for Mom and Dad -->
  <g data-hotspot="door-closed" data-hide-if="masterOpen">
    <rect x="684" y="226" width="232" height="414" fill="var(--accent)" opacity="0.5"/>
    <rect x="700" y="242" width="200" height="398" fill="var(--furniture)"/>
    <rect x="722" y="264" width="156" height="160" rx="3" fill="var(--void)" opacity="0.25"/>
    <rect x="722" y="446" width="156" height="170" rx="3" fill="var(--void)" opacity="0.25"/>
    <rect x="700" y="290" width="6" height="26" fill="var(--accent)"/>
    <rect x="700" y="566" width="6" height="26" fill="var(--accent)"/>
    <circle cx="876" cy="440" r="9" fill="var(--accent)"/>
    <rect x="846" y="435" width="34" height="10" rx="5" fill="var(--accent)"/>
    <rect x="702" y="636" width="196" height="4" fill="var(--void)" opacity="0.6"/>
    <circle cx="800" cy="276" r="3" fill="var(--accent)"/>
    <rect x="789" y="276" width="2" height="22" fill="var(--accent)" transform="rotate(-35 790 287)"/>
    <rect x="809" y="276" width="2" height="22" fill="var(--accent)" transform="rotate(35 810 287)"/>
    <use href="#master-door-heart" transform="translate(800 306)" fill="var(--glow)" opacity="0.4"/>
  </g>

  <!-- ...and open. It swung in by itself. Behind it: nothing but black. -->
  <g data-hotspot="door-open" data-show-if="masterOpen">
    <rect x="684" y="226" width="232" height="414" fill="var(--accent)" opacity="0.5"/>
    <rect x="700" y="242" width="200" height="398" fill="var(--void)"/>
    <polygon points="700,242 824,270 824,600 700,640" fill="var(--furniture)"/>
    <polygon points="714,267 810,286 810,421 714,424" fill="var(--void)" opacity="0.25"/>
    <polygon points="714,445 810,440 810,584 714,612" fill="var(--void)" opacity="0.25"/>
    <polygon points="824,270 830,272 830,598 824,600" fill="var(--accent)" opacity="0.5"/>
    <circle cx="812" cy="436" r="7" fill="var(--accent)"/>
    <rect x="794" y="432" width="20" height="8" rx="4" fill="var(--accent)"/>
    <use href="#master-door-heart" transform="translate(762 306) scale(0.62 0.93)" fill="var(--glow)" opacity="0.4"/>
    <polygon points="700,640 900,640 930,668 670,668" fill="var(--void)" opacity="0.35"/>
  </g>

  <!-- a light switch, and a big plant in a pot -->
  <rect x="936" y="398" width="26" height="42" rx="4" fill="var(--accent)" opacity="0.75"/>
  <rect x="943" y="406" width="12" height="26" rx="2" fill="var(--furniture)"/>
  <g fill="var(--accent)" opacity="0.85">
    <ellipse cx="1060" cy="520" rx="14" ry="56" transform="rotate(-28 1078 580)"/>
    <ellipse cx="1096" cy="500" rx="14" ry="66" transform="rotate(6 1094 576)"/>
    <ellipse cx="1128" cy="524" rx="14" ry="54" transform="rotate(32 1112 580)"/>
    <ellipse cx="1074" cy="548" rx="12" ry="40" transform="rotate(-60 1084 584)"/>
    <ellipse cx="1118" cy="548" rx="12" ry="40" transform="rotate(58 1106 584)"/>
  </g>
  <polygon points="1062,578 1126,578 1118,648 1070,648" fill="var(--furniture)"/>
  <rect x="1058" y="574" width="72" height="10" rx="3" fill="var(--furniture)"/>
  <rect x="1058" y="574" width="72" height="4" rx="2" fill="var(--accent)" opacity="0.5"/>
</svg>`;
