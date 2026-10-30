// Mom and Dad's bedroom: the big bed, the window with no curtains, the cat's tree house
// (she's asleep inside), and the door to the walk-in closet on the right.
// Clickable things have data-hotspot="...", the same names as in story.js.
ROOMS["master"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="master-lamp-light">
      <stop offset="0" style="stop-color: var(--glow)" stop-opacity="0.45"/>
      <stop offset="1" style="stop-color: var(--glow)" stop-opacity="0"/>
    </radialGradient>
    <!-- the rope wrapped around the scratching posts -->
    <pattern id="master-rope" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect y="8" width="12" height="3" fill="var(--void)" opacity="0.3"/>
    </pattern>
  </defs>

  <!-- the room: back wall, ceiling, floor and the two side walls -->
  <rect width="1600" height="900" fill="var(--wall)"/>
  <polygon points="0,0 1600,0 1200,160 400,160" fill="var(--void)" opacity="0.55"/>
  <polygon points="0,900 1600,900 1200,640 400,640" fill="var(--void)" opacity="0.4"/>
  <polygon points="0,0 400,160 400,640 0,900" fill="var(--void)" opacity="0.25"/>
  <polygon points="1600,0 1200,160 1200,640 1600,900" fill="var(--void)" opacity="0.25"/>
  <!-- rug under the bed -->
  <polygon points="450,700 1150,700 1200,780 400,780" fill="var(--accent)" opacity="0.3"/>

  <!-- the window over the bed. No curtains. Just glass, and the night. -->
  <g data-hotspot="window">
    <rect x="678" y="190" width="244" height="244" fill="var(--furniture)"/>
    <rect x="690" y="202" width="220" height="220" fill="var(--accent)" opacity="0.45"/>
    <rect x="690" y="342" width="48" height="80" fill="var(--void)" opacity="0.6"/>
    <rect x="758" y="314" width="60" height="108" fill="var(--void)" opacity="0.6"/>
    <rect x="845" y="354" width="65" height="68" fill="var(--void)" opacity="0.6"/>
    <rect x="706" y="364" width="7" height="9" fill="var(--glow)" opacity="0.7"/>
    <rect x="772" y="332" width="6" height="8" fill="var(--glow)" opacity="0.6"/>
    <rect x="796" y="384" width="7" height="9" fill="var(--glow)" opacity="0.8"/>
    <rect x="864" y="372" width="6" height="8" fill="var(--glow)" opacity="0.5"/>
    <rect x="886" y="396" width="7" height="8" fill="var(--glow)" opacity="0.7"/>
    <polygon points="730,202 760,202 708,422 690,422 690,372" fill="var(--glow)" opacity="0.06"/>
    <polygon points="840,202 856,202 810,422 794,422" fill="var(--glow)" opacity="0.05"/>
    <rect x="797" y="202" width="6" height="220" fill="var(--furniture)"/>
  </g>

  <!-- the face in the window (rule 3). Far away first... -->
  <g data-name="face" data-hidden>
    <ellipse cx="852" cy="292" rx="30" ry="40" fill="var(--skin)" opacity="0.55"/>
    <ellipse cx="841" cy="286" rx="5" ry="8" fill="var(--void)"/>
    <ellipse cx="863" cy="286" rx="5" ry="8" fill="var(--void)"/>
    <rect x="843" y="310" width="18" height="3" fill="var(--void)" opacity="0.8"/>
  </g>
  <!-- ...then pressed right against the glass -->
  <g data-name="face-close" data-hidden data-scare>
    <ellipse cx="800" cy="298" rx="50" ry="88" fill="var(--skin)"/>
    <ellipse cx="781" cy="282" rx="9" ry="15" fill="var(--void)"/>
    <ellipse cx="819" cy="284" rx="9" ry="13" fill="var(--void)"/>
    <ellipse cx="800" cy="344" rx="28" ry="4" fill="var(--void)" opacity="0.85"/>
    <g fill="var(--skin)" opacity="0.92">
      <rect x="706" y="344" width="44" height="54" rx="12"/>
      <rect x="706" y="310" width="9" height="40" rx="4"/>
      <rect x="718" y="302" width="9" height="46" rx="4"/>
      <rect x="730" y="304" width="9" height="44" rx="4"/>
      <rect x="742" y="314" width="8" height="36" rx="4"/>
      <rect x="850" y="344" width="44" height="54" rx="12"/>
      <rect x="850" y="314" width="8" height="36" rx="4"/>
      <rect x="861" y="304" width="9" height="44" rx="4"/>
      <rect x="873" y="302" width="9" height="46" rx="4"/>
      <rect x="885" y="310" width="9" height="40" rx="4"/>
    </g>
  </g>

  <!-- the wedding photo -->
  <rect x="1108" y="292" width="68" height="84" fill="var(--furniture)"/>
  <rect x="1115" y="299" width="54" height="70" fill="var(--accent)" opacity="0.45"/>
  <g fill="var(--void)" opacity="0.5">
    <circle cx="1132" cy="322" r="7"/><circle cx="1152" cy="320" r="7"/>
    <rect x="1122" y="331" width="40" height="38"/>
  </g>

  <!-- two nightstands -->
  <rect x="506" y="566" width="78" height="80" fill="var(--furniture)"/>
  <rect x="500" y="558" width="90" height="9" fill="var(--accent)"/>
  <rect x="514" y="580" width="62" height="28" fill="var(--void)" opacity="0.25"/>
  <rect x="1016" y="566" width="78" height="80" fill="var(--furniture)"/>
  <rect x="1010" y="558" width="90" height="9" fill="var(--accent)"/>
  <rect x="1024" y="580" width="62" height="28" fill="var(--void)" opacity="0.25"/>

  <!-- the big bed, neatly made -->
  <g data-hotspot="bed">
    <polygon points="600,640 1000,640 1100,757 500,757" fill="var(--void)" opacity="0.35"/>
    <rect x="588" y="452" width="424" height="124" rx="14" fill="var(--furniture)"/>
    <rect x="588" y="452" width="424" height="8" rx="4" fill="var(--accent)" opacity="0.6"/>
    <g fill="var(--void)" opacity="0.2">
      <rect x="606" y="472" width="88" height="90" rx="8"/><rect x="708" y="472" width="88" height="90" rx="8"/>
      <rect x="810" y="472" width="88" height="90" rx="8"/><rect x="912" y="472" width="82" height="90" rx="8"/>
    </g>
    <polygon points="600,570 1000,570 1100,652 500,652" fill="var(--furniture)"/>
    <polygon points="600,570 1000,570 1100,652 500,652" fill="var(--glow)" opacity="0.14"/>
    <rect x="622" y="562" width="160" height="30" rx="12" fill="var(--accent)"/>
    <rect x="622" y="562" width="160" height="30" rx="12" fill="var(--glow)" opacity="0.15"/>
    <rect x="818" y="562" width="160" height="30" rx="12" fill="var(--accent)"/>
    <rect x="818" y="562" width="160" height="30" rx="12" fill="var(--glow)" opacity="0.15"/>
    <polygon points="576,598 1024,598 1100,652 500,652" fill="var(--accent)"/>
    <polygon points="576,598 1024,598 1032,607 568,607" fill="var(--glow)" opacity="0.2"/>
    <polygon points="530,630 1070,630 1100,652 500,652" fill="var(--furniture)" opacity="0.8"/>
    <rect x="500" y="652" width="600" height="50" fill="var(--accent)"/>
    <rect x="500" y="652" width="600" height="50" fill="var(--void)" opacity="0.15"/>
    <rect x="500" y="652" width="600" height="22" fill="var(--furniture)" opacity="0.8"/>
    <rect x="500" y="700" width="600" height="28" fill="var(--furniture)"/>
    <rect x="506" y="726" width="14" height="30" fill="var(--furniture)"/>
    <rect x="1080" y="726" width="14" height="30" fill="var(--furniture)"/>
  </g>

  <!-- bedside lamps, and their light while the lights still work -->
  <g data-name="lamp-glow" data-light-only>
    <circle cx="545" cy="512" r="160" fill="url(#master-lamp-light)"/>
    <circle cx="1055" cy="512" r="160" fill="url(#master-lamp-light)"/>
  </g>
  <ellipse cx="545" cy="556" rx="16" ry="4" fill="var(--furniture)"/>
  <rect x="542" y="526" width="6" height="30" fill="var(--furniture)"/>
  <polygon points="523,494 567,494 579,530 511,530" fill="var(--accent)"/>
  <ellipse cx="1055" cy="556" rx="16" ry="4" fill="var(--furniture)"/>
  <rect x="1052" y="526" width="6" height="30" fill="var(--furniture)"/>
  <polygon points="1033,494 1077,494 1089,530 1021,530" fill="var(--accent)"/>

  <!-- the cat's tree house: scratching posts, a perch, and a little house with a round door -->
  <g data-hotspot="tree-house">
    <rect x="232" y="722" width="216" height="28" rx="6" fill="var(--furniture)"/>
    <rect x="232" y="722" width="216" height="5" rx="2" fill="var(--accent)" opacity="0.5"/>
    <rect x="296" y="600" width="30" height="124" fill="var(--accent)"/>
    <rect x="296" y="600" width="30" height="124" fill="url(#master-rope)"/>
    <rect x="404" y="468" width="22" height="256" fill="var(--accent)"/>
    <rect x="404" y="468" width="22" height="256" fill="url(#master-rope)"/>
    <rect x="384" y="456" width="66" height="14" rx="4" fill="var(--accent)"/>
    <rect x="443" y="470" width="2" height="38" fill="var(--accent)"/>
    <circle cx="444" cy="514" r="8" fill="var(--glow)" opacity="0.35"/>
    <rect x="226" y="476" width="168" height="128" rx="4" fill="var(--furniture)"/>
    <polygon points="214,482 310,414 406,482" fill="var(--accent)"/>
    <polygon points="310,414 406,482 390,482 310,428" fill="var(--void)" opacity="0.2"/>
    <circle cx="310" cy="550" r="42" fill="var(--void)"/>
  </g>
  <!-- ...and the cat inside, curled up, fast asleep -->
  <g data-name="cat-asleep">
    <ellipse cx="316" cy="568" rx="32" ry="17" fill="var(--accent)"/>
    <path d="M346,566 Q350,586 318,586 Q298,586 288,576" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" fill="none"/>
    <polygon points="278,556 280,538 292,550" fill="var(--accent)"/>
    <polygon points="292,550 302,537 306,554" fill="var(--accent)"/>
    <circle cx="292" cy="562" r="15" fill="var(--accent)"/>
    <circle cx="292" cy="562" r="15" fill="var(--glow)" opacity="0.08"/>
    <path d="M282,562 Q285,566 288,562 Q285,564 282,562 Z" fill="var(--void)"/>
    <path d="M295,562 Q298,566 301,562 Q298,564 295,562 Z" fill="var(--void)"/>
  </g>

  <!-- the walk-in closet door (right wall) -->
  <g data-hotspot="walk-in-door">
    <polygon points="1250,209 1400,170 1400,770 1250,673" fill="var(--accent)" opacity="0.5"/>
    <polygon points="1262,217 1388,186 1388,762 1262,680" fill="var(--furniture)"/>
    <polygon points="1280,246 1372,230 1372,421 1280,410" fill="var(--void)" opacity="0.25"/>
    <polygon points="1280,444 1372,461 1372,706 1280,653" fill="var(--void)" opacity="0.25"/>
    <rect x="1382" y="300" width="6" height="30" fill="var(--accent)"/>
    <rect x="1382" y="610" width="6" height="34" fill="var(--accent)"/>
    <circle cx="1282" cy="439" r="10" fill="var(--accent)"/>
  </g>
</svg>`;
