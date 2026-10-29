// Your little sister's room: her bed, her toys, the moon night-light and a window (no curtains, like everywhere in the apartment).
// Your sister is drawn three ways: awake and playing, asleep under the blanket, or gone (the empty bed).
// Clickable things have data-hotspot="...", the same names as in story.js.
ROOMS["sister-room"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sister-room-night-light">
      <stop offset="0" style="stop-color: var(--glow)" stop-opacity="0.45"/>
      <stop offset="1" style="stop-color: var(--glow)" stop-opacity="0"/>
    </radialGradient>
    <polygon id="sister-room-star" points="0,-9 2.2,-3.1 8.6,-2.8 3.6,1.2 5.3,7.3 0,3.8 -5.3,7.3 -3.6,1.2 -8.6,-2.8 -2.2,-3.1"/>
    <!-- shapes drawn twice: once solid, once in warm light on top, so they look golden-brown -->
    <g id="sister-room-hair">
      <ellipse cx="610" cy="574" rx="33" ry="31"/><ellipse cx="573" cy="594" rx="11" ry="14"/><ellipse cx="647" cy="594" rx="11" ry="14"/>
    </g>
    <path id="sister-room-lap" d="M556,702 Q558,678 610,676 Q662,678 664,702 Q640,714 610,710 Q580,714 556,702 Z"/>
    <path id="sister-room-bangs" d="M584,582 Q586,556 610,554 Q634,556 636,582 Q624,570 612,573 Q598,569 584,582 Z"/>
    <g id="sister-room-bunny">
      <ellipse cx="1362" cy="698" rx="26" ry="28"/><circle cx="1362" cy="656" r="21"/>
      <ellipse cx="1352" cy="618" rx="7" ry="24" transform="rotate(-8 1352 640)"/><ellipse cx="1376" cy="626" rx="7" ry="22" transform="rotate(28 1374 644)"/>
      <ellipse cx="1346" cy="724" rx="11" ry="6"/><ellipse cx="1378" cy="724" rx="11" ry="6"/>
    </g>
  </defs>

  <!-- the room: back wall, ceiling, floor and the two side walls -->
  <rect width="1600" height="900" fill="var(--wall)"/>
  <polygon points="0,0 1600,0 1200,160 400,160" fill="var(--void)" opacity="0.55"/>
  <polygon points="0,900 1600,900 1200,640 400,640" fill="var(--void)" opacity="0.4"/>
  <polygon points="0,0 400,160 400,640 0,900" fill="var(--void)" opacity="0.25"/>
  <polygon points="1600,0 1200,160 1200,640 1600,900" fill="var(--void)" opacity="0.25"/>
  <!-- round rug, and glow-in-the-dark stars stuck on the wall -->
  <ellipse cx="624" cy="714" rx="170" ry="36" fill="var(--accent)" opacity="0.3"/>
  <g fill="var(--glow)" opacity="0.3">
    <use href="#sister-room-star" transform="translate(880 250)"/><use href="#sister-room-star" transform="translate(950 212) scale(0.8)"/>
    <use href="#sister-room-star" transform="translate(1080 228) scale(1.1)"/><use href="#sister-room-star" transform="translate(1146 290) scale(0.8)"/>
    <use href="#sister-room-star" transform="translate(760 118) scale(1.2)"/><use href="#sister-room-star" transform="translate(1010 96) scale(0.9)"/>
  </g>

  <!-- the door to the hallway (left wall), with a star on it -->
  <polygon points="175,163 345,208 345,676 175,786" fill="var(--accent)" opacity="0.5"/>
  <polygon points="187,174 333,213 333,683 187,778" fill="var(--furniture)"/>
  <polygon points="205,219 318,240 318,382 205,390" fill="var(--void)" opacity="0.25"/>
  <polygon points="205,459 318,439 318,625 205,685" fill="var(--void)" opacity="0.25"/>
  <use href="#sister-room-star" transform="translate(262 304) scale(2.4)" fill="var(--glow)" opacity="0.35"/>
  <circle cx="318" cy="414" r="10" fill="var(--accent)"/><rect x="270" y="409" width="50" height="10" rx="5" fill="var(--accent)"/>
  <g data-name="hall-glow" data-hide-if="dark">
    <polygon points="187,774 333,679 333,684 187,779" fill="var(--glow)" opacity="0.35"/>
  </g>

  <!-- the window: bare glass, no curtains. Just the dark out there. -->
  <g data-hotspot="window">
    <rect x="450" y="198" width="244" height="244" fill="var(--furniture)"/>
    <rect x="462" y="210" width="220" height="220" fill="var(--accent)" opacity="0.45"/>
    <rect x="462" y="350" width="48" height="80" fill="var(--void)" opacity="0.6"/>
    <rect x="530" y="322" width="60" height="108" fill="var(--void)" opacity="0.6"/>
    <rect x="617" y="362" width="65" height="68" fill="var(--void)" opacity="0.6"/>
    <rect x="544" y="340" width="6" height="8" fill="var(--glow)" opacity="0.5"/>
    <polygon points="502,210 532,210 480,430 462,430 462,380" fill="var(--glow)" opacity="0.06"/>
    <polygon points="612,210 628,210 582,430 566,430" fill="var(--glow)" opacity="0.05"/>
    <rect x="569" y="210" width="6" height="220" fill="var(--furniture)"/>
    <rect x="440" y="440" width="264" height="10" fill="var(--accent)"/>
  </g>

  <!-- the face in the window (rule 3). Far away first... -->
  <g data-name="face" data-show-if="face">
    <ellipse cx="624" cy="300" rx="30" ry="40" fill="var(--skin)" opacity="0.55"/>
    <ellipse cx="613" cy="294" rx="5" ry="8" fill="var(--void)"/>
    <ellipse cx="635" cy="294" rx="5" ry="8" fill="var(--void)"/>
    <rect x="615" y="318" width="18" height="3" fill="var(--void)" opacity="0.8"/>
  </g>
  <!-- ...then pressed right against the glass -->
  <g data-name="face-close" data-show-if="faceClose" data-scare>
    <ellipse cx="572" cy="306" rx="50" ry="88" fill="var(--skin)"/>
    <ellipse cx="553" cy="290" rx="9" ry="15" fill="var(--void)"/>
    <ellipse cx="591" cy="292" rx="9" ry="13" fill="var(--void)"/>
    <ellipse cx="572" cy="352" rx="28" ry="4" fill="var(--void)" opacity="0.85"/>
    <g fill="var(--skin)" opacity="0.92">
      <rect x="478" y="352" width="44" height="54" rx="12"/>
      <rect x="478" y="318" width="9" height="40" rx="4"/>
      <rect x="490" y="310" width="9" height="46" rx="4"/>
      <rect x="502" y="312" width="9" height="44" rx="4"/>
      <rect x="514" y="322" width="8" height="36" rx="4"/>
      <rect x="622" y="352" width="44" height="54" rx="12"/>
      <rect x="622" y="322" width="8" height="36" rx="4"/>
      <rect x="633" y="312" width="9" height="44" rx="4"/>
      <rect x="645" y="310" width="9" height="46" rx="4"/>
      <rect x="657" y="318" width="9" height="40" rx="4"/>
    </g>
  </g>

  <!-- her drawing, taped to the wall: our house, the sun, and the four of us -->
  <g transform="rotate(3 1010 364)">
    <rect x="966" y="330" width="88" height="68" fill="var(--glow)" opacity="0.5"/>
    <circle cx="1038" cy="346" r="8" fill="var(--accent)"/>
    <polygon points="976,370 994,352 1012,370" fill="var(--accent)"/>
    <rect x="979" y="370" width="30" height="20" fill="var(--accent)" opacity="0.6"/>
    <g fill="var(--void)" opacity="0.55">
      <circle cx="1020" cy="372" r="3"/><rect x="1019" y="375" width="2" height="13"/><circle cx="1029" cy="370" r="3"/><rect x="1028" y="373" width="2" height="15"/>
      <circle cx="1038" cy="376" r="2.5"/><rect x="1037" y="378" width="2" height="10"/><circle cx="1046" cy="378" r="2.5"/><rect x="1045" y="380" width="2" height="8"/>
    </g>
    <rect x="1000" y="325" width="20" height="8" fill="var(--glow)" opacity="0.3"/>
  </g>

  <!-- nightstand, and the little moon night-light on it -->
  <rect x="714" y="566" width="78" height="80" fill="var(--furniture)"/><rect x="708" y="558" width="90" height="9" fill="var(--accent)"/>
  <rect x="722" y="580" width="62" height="28" fill="var(--void)" opacity="0.25"/><rect x="744" y="590" width="18" height="5" rx="2" fill="var(--accent)"/>
  <g data-hotspot="night-light">
    <rect x="716" y="480" width="76" height="82" fill="var(--void)" opacity="0"/>
    <rect x="732" y="550" width="44" height="9" rx="4" fill="var(--accent)"/>
    <rect x="749" y="538" width="10" height="14" fill="var(--furniture)"/>
    <path d="M749.4,486.2 A30,30 0 1 0 780.6,527.8 A26,26 0 0 1 749.4,486.2 Z" fill="var(--accent)"/>
  </g>
  <g data-name="night-glow" data-hide-if="dark">
    <circle cx="755" cy="516" r="230" fill="url(#sister-room-night-light)"/>
    <ellipse cx="752" cy="660" rx="96" ry="13" fill="var(--glow)" opacity="0.07"/>
    <path d="M749.4,486.2 A30,30 0 1 0 780.6,527.8 A26,26 0 0 1 749.4,486.2 Z" fill="var(--glow)" opacity="0.9"/>
  </g>

  <!-- her little bed -->
  <rect x="806" y="452" width="36" height="196" rx="12" fill="var(--furniture)"/><rect x="1140" y="508" width="36" height="140" rx="12" fill="var(--furniture)"/>
  <rect x="806" y="452" width="36" height="8" rx="4" fill="var(--accent)" opacity="0.6"/><rect x="1140" y="508" width="36" height="8" rx="4" fill="var(--accent)" opacity="0.6"/>
  <rect x="842" y="626" width="298" height="18" fill="var(--void)" opacity="0.4"/>
  <rect x="836" y="584" width="310" height="44" fill="var(--furniture)"/>
  <rect x="836" y="556" width="308" height="30" rx="6" fill="var(--furniture)"/><rect x="836" y="556" width="308" height="30" rx="6" fill="var(--glow)" opacity="0.15"/>
  <rect x="846" y="534" width="76" height="24" rx="11" fill="var(--accent)"/><rect x="846" y="534" width="76" height="24" rx="11" fill="var(--glow)" opacity="0.15"/>
  <!-- the blanket, neatly made while she's still up -->
  <g data-name="blanket" data-hide-if="sisterAsleep">
    <rect x="902" y="548" width="238" height="64" rx="6" fill="var(--accent)"/>
    <rect x="902" y="548" width="16" height="64" fill="var(--glow)" opacity="0.18"/>
    <g fill="var(--glow)" opacity="0.3">
      <circle cx="950" cy="566" r="3"/><circle cx="1000" cy="590" r="3"/><circle cx="1050" cy="566" r="3"/><circle cx="1100" cy="590" r="3"/>
    </g>
  </g>

  <!-- your sister asleep: a little head on the pillow, the rest of her under the blanket -->
  <g data-hotspot="sister-asleep" data-show-if="sisterAsleep" data-hide-if="sisterWithYou">
    <ellipse cx="872" cy="537" rx="26" ry="17" fill="var(--furniture)"/><ellipse cx="872" cy="537" rx="26" ry="17" fill="var(--glow)" opacity="0.5"/>
    <ellipse cx="885" cy="543" rx="15" ry="14" fill="var(--skin)"/>
    <path d="M876,543 Q880,547 884,543 Q880,545 876,543 Z" fill="var(--void)"/><path d="M888,543 Q892,547 896,543 Q892,545 888,543 Z" fill="var(--void)"/>
    <path d="M902,612 L902,548 Q906,536 924,534 Q948,520 984,524 Q1020,526 1040,540 Q1070,548 1100,548 L1140,550 L1140,612 Z" fill="var(--accent)"/>
    <polygon points="902,548 916,538 916,612 902,612" fill="var(--glow)" opacity="0.18"/>
    <g fill="var(--glow)" opacity="0.3">
      <circle cx="950" cy="560" r="3"/><circle cx="1000" cy="590" r="3"/><circle cx="1050" cy="566" r="3"/><circle cx="1100" cy="590" r="3"/>
    </g>
  </g>

  <!-- the empty bed: the blanket thrown back, nobody there -->
  <g data-name="bed-empty" data-show-if="sisterWithYou">
    <ellipse cx="884" cy="548" rx="24" ry="6" fill="var(--void)" opacity="0.2"/>
    <path d="M1030,612 L1030,560 Q1040,528 1076,526 Q1110,520 1128,540 L1140,550 L1140,612 Z" fill="var(--accent)"/>
    <path d="M1044,560 Q1070,540 1110,546 Q1072,548 1046,566 Z" fill="var(--void)" opacity="0.3"/>
    <polygon points="1030,596 1062,604 1054,648 1022,638" fill="var(--accent)"/><polygon points="1030,596 1062,604 1054,648 1022,638" fill="var(--void)" opacity="0.2"/>
  </g>

  <!-- your sister, awake: sitting on the rug in her pajamas, playing a board game -->
  <g data-hotspot="sister-awake" data-hide-if="sisterAsleep">
    <use href="#sister-room-lap" fill="var(--accent)"/><use href="#sister-room-lap" fill="var(--void)" opacity="0.2"/>
    <ellipse cx="570" cy="703" rx="12" ry="7" fill="var(--glow)" opacity="0.45"/><ellipse cx="650" cy="704" rx="12" ry="7" fill="var(--glow)" opacity="0.45"/>
    <path d="M588,612 Q610,604 632,612 L642,682 L578,682 Z" fill="var(--accent)"/>
    <g fill="var(--glow)" opacity="0.4">
      <circle cx="596" cy="630" r="2.5"/><circle cx="620" cy="624" r="2.5"/><circle cx="608" cy="648" r="2.5"/><circle cx="630" cy="660" r="2.5"/><circle cx="590" cy="664" r="2.5"/><circle cx="584" cy="694" r="2.5"/><circle cx="636" cy="694" r="2.5"/>
    </g>
    <rect x="576" y="614" width="14" height="64" rx="7" fill="var(--accent)" transform="rotate(14 583 616)"/><rect x="630" y="614" width="14" height="106" rx="7" fill="var(--accent)" transform="rotate(-24 637 616)"/>
    <circle cx="568" cy="680" r="7" fill="var(--skin)"/><circle cx="680" cy="712" r="7" fill="var(--skin)"/>
    <use href="#sister-room-hair" fill="var(--furniture)"/><use href="#sister-room-hair" fill="var(--glow)" opacity="0.5"/>
    <ellipse cx="610" cy="586" rx="26" ry="25" fill="var(--skin)"/>
    <use href="#sister-room-bangs" fill="var(--furniture)"/><use href="#sister-room-bangs" fill="var(--glow)" opacity="0.5"/>
    <circle cx="581" cy="584" r="4" fill="var(--accent)"/><circle cx="639" cy="584" r="4" fill="var(--accent)"/>
    <ellipse cx="600" cy="590" rx="3.5" ry="4.5" fill="var(--void)"/><ellipse cx="620" cy="590" rx="3.5" ry="4.5" fill="var(--void)"/>
    <circle cx="601.5" cy="588.5" r="1.3" fill="var(--glow)"/><circle cx="621.5" cy="588.5" r="1.3" fill="var(--glow)"/>
    <ellipse cx="593" cy="599" rx="5" ry="3" fill="var(--glow)" opacity="0.3"/><ellipse cx="627" cy="599" rx="5" ry="3" fill="var(--glow)" opacity="0.3"/>
    <path d="M603,601 Q610,608 617,601 Q610,604 603,601 Z" fill="var(--void)" opacity="0.7"/>
    <!-- the board game. She's winning. -->
    <polygon points="556,720 692,720 708,750 540,750" fill="var(--furniture)"/>
    <polygon points="566,724 682,724 694,746 554,746" fill="var(--accent)" opacity="0.6"/>
    <g fill="var(--glow)" opacity="0.35">
      <circle cx="578" cy="735" r="4"/><circle cx="598" cy="735" r="4"/><circle cx="618" cy="735" r="4"/>
      <circle cx="638" cy="735" r="4"/><circle cx="658" cy="735" r="4"/>
    </g>
    <circle cx="618" cy="730" r="5" fill="var(--glow)" opacity="0.85"/><circle cx="598" cy="730" r="5" fill="var(--furniture)"/>
    <rect x="664" y="724" width="12" height="12" rx="2" fill="var(--glow)" opacity="0.75"/><circle cx="670" cy="730" r="1.8" fill="var(--void)"/>
  </g>

  <!-- the toys: a teddy (missing an eye), a bunny, a ball and blocks -->
  <g data-hotspot="toys">
    <ellipse cx="1268" cy="650" rx="40" ry="40" fill="var(--accent)"/>
    <ellipse cx="1268" cy="658" rx="22" ry="20" fill="var(--glow)" opacity="0.12"/>
    <ellipse cx="1228" cy="642" rx="12" ry="22" fill="var(--accent)" transform="rotate(20 1228 642)"/><ellipse cx="1308" cy="642" rx="12" ry="22" fill="var(--accent)" transform="rotate(-20 1308 642)"/>
    <ellipse cx="1240" cy="686" rx="17" ry="12" fill="var(--accent)"/><ellipse cx="1296" cy="686" rx="17" ry="12" fill="var(--accent)"/>
    <circle cx="1242" cy="564" r="11" fill="var(--accent)"/><circle cx="1294" cy="564" r="11" fill="var(--accent)"/>
    <circle cx="1268" cy="590" r="32" fill="var(--accent)"/>
    <circle cx="1242" cy="564" r="5" fill="var(--glow)" opacity="0.25"/><circle cx="1294" cy="564" r="5" fill="var(--glow)" opacity="0.25"/>
    <ellipse cx="1268" cy="602" rx="13" ry="10" fill="var(--glow)" opacity="0.3"/>
    <ellipse cx="1268" cy="597" rx="5" ry="3.5" fill="var(--void)"/>
    <circle cx="1280" cy="582" r="4" fill="var(--void)"/>
    <g fill="var(--void)" opacity="0.6">
      <rect x="1251" y="581" width="10" height="2" transform="rotate(45 1256 582)"/><rect x="1251" y="581" width="10" height="2" transform="rotate(-45 1256 582)"/>
      <rect x="1255" y="584" width="1.5" height="10"/>
    </g>
    <use href="#sister-room-bunny" fill="var(--furniture)"/><use href="#sister-room-bunny" fill="var(--glow)" opacity="0.2"/>
    <circle cx="1355" cy="654" r="2.6" fill="var(--void)"/><circle cx="1369" cy="654" r="2.6" fill="var(--void)"/>
    <ellipse cx="1362" cy="662" rx="3" ry="2" fill="var(--accent)"/>
    <rect x="1296" y="704" width="24" height="24" rx="2" fill="var(--furniture)"/><rect x="1302" y="710" width="12" height="12" fill="var(--glow)" opacity="0.3"/>
    <circle cx="1200" cy="724" r="20" fill="var(--accent)"/><ellipse cx="1200" cy="724" rx="20" ry="6" fill="var(--glow)" opacity="0.3"/>
  </g>
</svg>`;
