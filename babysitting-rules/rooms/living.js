// The living room with the open kitchen. This is the "reference room": the other rooms copy
// its perspective (back wall in the middle, horizon at y=405) and its colors.
// Clickable things have data-hotspot="...", the same names as in story.js.
ROOMS["living"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="living-lamp-light">
      <stop offset="0" style="stop-color: var(--glow)" stop-opacity="0.5"/>
      <stop offset="1" style="stop-color: var(--glow)" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- the room: back wall, ceiling, floor and the two side walls -->
  <rect width="1600" height="900" fill="var(--wall)"/>
  <polygon points="0,0 1600,0 1200,160 400,160" fill="var(--void)" opacity="0.55"/>
  <polygon points="0,900 1600,900 1200,640 400,640" fill="var(--void)" opacity="0.4"/>
  <polygon points="0,0 400,160 400,640 0,900" fill="var(--void)" opacity="0.25"/>
  <polygon points="1600,0 1200,160 1200,640 1600,900" fill="var(--void)" opacity="0.25"/>
  <!-- rug -->
  <polygon points="760,662 1120,662 1230,770 650,770" fill="var(--accent)" opacity="0.3"/>

  <!-- doorway to the hallway (left wall) -->
  <polygon points="138,166 312,204 312,712 138,812" fill="var(--furniture)"/>
  <polygon points="150,172 300,208 300,705 150,802" fill="var(--void)"/>

  <!-- the not-sister, standing in the doorway. Too still. -->
  <g data-hotspot="not-sister" data-hidden>
    <rect x="178" y="450" width="96" height="300" fill="var(--void)" opacity="0"/>
    <path d="M192,472 Q194,438 226,436 Q258,438 260,472 L262,520 L190,520 Z" fill="var(--void)"/>
    <ellipse cx="226" cy="482" rx="28" ry="33" fill="var(--skin)"/>
    <ellipse cx="215" cy="480" rx="4" ry="6" fill="var(--void)"/>
    <ellipse cx="237" cy="480" rx="4" ry="6" fill="var(--void)"/>
    <polygon points="200,520 252,520 270,672 182,672" fill="var(--skin)" opacity="0.6"/>
    <rect x="186" y="526" width="11" height="110" rx="5" fill="var(--skin)" opacity="0.85"/>
    <rect x="255" y="526" width="11" height="110" rx="5" fill="var(--skin)" opacity="0.85"/>
    <rect x="206" y="670" width="13" height="72" fill="var(--skin)" opacity="0.85"/>
    <rect x="233" y="670" width="13" height="74" fill="var(--skin)" opacity="0.85"/>
  </g>

  <!-- kitchen: cabinets and counter -->
  <rect x="555" y="196" width="65" height="100" fill="var(--furniture)"/>
  <rect x="625" y="196" width="65" height="100" fill="var(--furniture)"/>
  <rect x="695" y="196" width="65" height="100" fill="var(--furniture)"/>
  <rect x="608" y="276" width="6" height="14" fill="var(--accent)"/>
  <rect x="631" y="276" width="6" height="14" fill="var(--accent)"/>
  <rect x="701" y="276" width="6" height="14" fill="var(--accent)"/>
  <g data-hotspot="counter">
    <rect x="550" y="500" width="215" height="140" fill="var(--furniture)"/>
    <rect x="545" y="492" width="225" height="12" fill="var(--accent)"/>
    <rect x="562" y="516" width="90" height="112" fill="var(--void)" opacity="0.25"/>
    <rect x="662" y="516" width="90" height="112" fill="var(--void)" opacity="0.25"/>
    <path d="M690,492 L692,462 Q712,452 732,462 L734,492 Z" fill="var(--accent)" opacity="0.7"/>
  </g>

  <!-- fridge, with the note on it -->
  <g data-hotspot="fridge">
    <rect x="420" y="228" width="122" height="412" rx="6" fill="var(--furniture)"/>
    <rect x="420" y="330" width="122" height="5" fill="var(--void)" opacity="0.5"/>
    <rect x="526" y="250" width="6" height="60" rx="3" fill="var(--accent)"/>
    <rect x="526" y="350" width="6" height="90" rx="3" fill="var(--accent)"/>
  </g>
  <g data-hotspot="fridge-note" transform="rotate(-4 475 420)">
    <rect x="448" y="388" width="56" height="70" fill="var(--glow)" opacity="0.55"/>
    <rect x="456" y="402" width="38" height="3" fill="var(--void)" opacity="0.5"/>
    <rect x="456" y="412" width="32" height="3" fill="var(--void)" opacity="0.5"/>
    <rect x="456" y="422" width="36" height="3" fill="var(--void)" opacity="0.5"/>
    <rect x="456" y="432" width="26" height="3" fill="var(--void)" opacity="0.5"/>
    <circle cx="476" cy="390" r="6" fill="var(--accent)"/>
  </g>

  <!-- the cat's bowl -->
  <g data-hotspot="cat-bowl">
    <ellipse cx="640" cy="708" rx="42" ry="13" fill="var(--accent)"/>
    <ellipse cx="640" cy="704" rx="30" ry="7" fill="var(--void)" opacity="0.5"/>
  </g>

  <!-- window above the sofa: night city far below -->
  <g data-hotspot="window">
    <rect x="818" y="198" width="244" height="244" fill="var(--furniture)"/>
    <rect x="830" y="210" width="220" height="220" fill="var(--accent)" opacity="0.45"/>
    <rect x="830" y="350" width="48" height="80" fill="var(--void)" opacity="0.6"/>
    <rect x="898" y="322" width="60" height="108" fill="var(--void)" opacity="0.6"/>
    <rect x="985" y="362" width="65" height="68" fill="var(--void)" opacity="0.6"/>
    <rect x="846" y="372" width="7" height="9" fill="var(--glow)" opacity="0.7"/>
    <rect x="912" y="340" width="6" height="8" fill="var(--glow)" opacity="0.6"/>
    <rect x="936" y="392" width="7" height="9" fill="var(--glow)" opacity="0.8"/>
    <rect x="1004" y="380" width="6" height="8" fill="var(--glow)" opacity="0.5"/>
    <rect x="1026" y="404" width="7" height="8" fill="var(--glow)" opacity="0.7"/>
    <polygon points="870,210 900,210 848,430 830,430 830,380" fill="var(--glow)" opacity="0.06"/>
    <polygon points="980,210 996,210 950,430 934,430" fill="var(--glow)" opacity="0.05"/>
    <rect x="937" y="210" width="6" height="220" fill="var(--furniture)"/>
  </g>

  <!-- the face in the window (rule 3). Far away first... -->
  <g data-name="face" data-hidden>
    <ellipse cx="992" cy="300" rx="30" ry="40" fill="var(--skin)" opacity="0.55"/>
    <ellipse cx="981" cy="294" rx="5" ry="8" fill="var(--void)"/>
    <ellipse cx="1003" cy="294" rx="5" ry="8" fill="var(--void)"/>
    <rect x="983" y="318" width="18" height="3" fill="var(--void)" opacity="0.8"/>
  </g>
  <!-- ...then pressed right against the glass -->
  <g data-name="face-close" data-hidden data-scare>
    <ellipse cx="940" cy="306" rx="50" ry="88" fill="var(--skin)"/>
    <ellipse cx="921" cy="290" rx="9" ry="15" fill="var(--void)"/>
    <ellipse cx="959" cy="292" rx="9" ry="13" fill="var(--void)"/>
    <ellipse cx="940" cy="352" rx="28" ry="4" fill="var(--void)" opacity="0.85"/>
    <g fill="var(--skin)" opacity="0.92">
      <rect x="846" y="352" width="44" height="54" rx="12"/>
      <rect x="846" y="318" width="9" height="40" rx="4"/>
      <rect x="858" y="310" width="9" height="46" rx="4"/>
      <rect x="870" y="312" width="9" height="44" rx="4"/>
      <rect x="882" y="322" width="8" height="36" rx="4"/>
      <rect x="990" y="352" width="44" height="54" rx="12"/>
      <rect x="990" y="322" width="8" height="36" rx="4"/>
      <rect x="1001" y="312" width="9" height="44" rx="4"/>
      <rect x="1013" y="310" width="9" height="46" rx="4"/>
      <rect x="1025" y="318" width="9" height="40" rx="4"/>
    </g>
  </g>

  <!-- sofa -->
  <g data-hotspot="sofa">
    <rect x="822" y="500" width="246" height="76" rx="12" fill="var(--furniture)"/>
    <rect x="822" y="500" width="246" height="8" rx="4" fill="var(--accent)" opacity="0.6"/>
    <rect x="800" y="568" width="290" height="70" rx="10" fill="var(--furniture)"/>
    <rect x="788" y="540" width="46" height="108" rx="14" fill="var(--furniture)"/>
    <rect x="1056" y="540" width="46" height="108" rx="14" fill="var(--furniture)"/>
    <rect x="850" y="574" width="96" height="10" rx="5" fill="var(--accent)" opacity="0.3"/>
    <rect x="950" y="574" width="96" height="10" rx="5" fill="var(--accent)" opacity="0.3"/>
  </g>

  <!-- floor lamp, and its light while the lights still work -->
  <g data-name="lamp-glow" data-light-only>
    <circle cx="1140" cy="392" r="200" fill="url(#living-lamp-light)"/>
    <ellipse cx="1140" cy="664" rx="160" ry="30" fill="var(--glow)" opacity="0.1"/>
  </g>
  <rect x="1137" y="398" width="6" height="244" fill="var(--furniture)"/>
  <ellipse cx="1140" cy="643" rx="26" ry="6" fill="var(--furniture)"/>
  <polygon points="1106,352 1174,352 1192,400 1088,400" fill="var(--accent)"/>

  <!-- glass balcony door (right wall), a mirror after dark -->
  <g data-hotspot="balcony-door">
    <polygon points="1220,204 1440,150 1440,797 1220,664" fill="var(--furniture)"/>
    <polygon points="1240,218 1420,170 1420,780 1240,654" fill="var(--accent)" opacity="0.4"/>
    <rect x="1262" y="300" width="7" height="9" fill="var(--glow)" opacity="0.6"/>
    <rect x="1318" y="262" width="6" height="8" fill="var(--glow)" opacity="0.5"/>
    <rect x="1385" y="318" width="7" height="9" fill="var(--glow)" opacity="0.7"/>
    <polygon points="1240,468 1420,513 1420,521 1240,476" fill="var(--void)" opacity="0.7"/>
    <rect x="1280" y="478" width="4" height="188" fill="var(--void)" opacity="0.5"/>
    <rect x="1330" y="490" width="4" height="210" fill="var(--void)" opacity="0.5"/>
    <rect x="1380" y="503" width="4" height="232" fill="var(--void)" opacity="0.5"/>
    <polygon points="1300,202 1330,194 1262,640 1240,640 1240,560" fill="var(--glow)" opacity="0.06"/>
    <polygon points="1392,178 1406,174 1350,700 1336,690" fill="var(--glow)" opacity="0.05"/>
    <rect x="1246" y="420" width="8" height="40" rx="3" fill="var(--accent)"/>
  </g>

  <!-- the cat on the balcony (rule 5). Her eyes catch your light. -->
  <g data-hotspot="cat-outside" data-hidden>
    <path d="M1262,680 Q1258,628 1286,612 Q1312,628 1310,684 Z" fill="var(--void)"/>
    <circle cx="1286" cy="600" r="20" fill="var(--void)"/>
    <polygon points="1270,590 1272,566 1284,584" fill="var(--void)"/>
    <polygon points="1302,590 1300,566 1288,584" fill="var(--void)"/>
    <path d="M1306,676 Q1336,676 1334,640" stroke="var(--void)" stroke-width="7" fill="none"/>
    <rect x="1294" y="616" width="9" height="40" rx="4" fill="var(--void)" transform="rotate(-25 1298 616)"/>
    <ellipse cx="1279" cy="600" rx="4" ry="3" fill="var(--glow)"/>
    <ellipse cx="1293" cy="600" rx="4" ry="3" fill="var(--glow)"/>
  </g>

  <!-- your reflection in the glass (rule 2). It moves when you don't. -->
  <g data-hotspot="reflection" data-hidden opacity="0.8">
    <circle cx="1352" cy="442" r="24" fill="var(--void)"/>
    <path d="M1330,440 Q1352,410 1374,440 L1378,480 L1326,480 Z" fill="var(--void)"/>
    <polygon points="1330,474 1374,474 1388,640 1318,640" fill="var(--void)"/>
    <rect x="1372" y="476" width="11" height="70" rx="5" fill="var(--void)" transform="rotate(-30 1376 478)"/>
    <rect x="1330" y="636" width="13" height="78" fill="var(--void)"/>
    <rect x="1360" y="636" width="13" height="82" fill="var(--void)"/>
    <circle cx="1404" cy="520" r="4" fill="var(--glow)" opacity="0.8"/>
  </g>

  <!-- wet footprints by the balcony door: you only see them by flashlight -->
  <g data-name="footprints" data-dark-only fill="var(--accent)" opacity="0.35">
    <ellipse cx="1196" cy="742" rx="12" ry="6"/>
    <ellipse cx="1150" cy="776" rx="12" ry="6"/>
    <ellipse cx="1178" cy="812" rx="12" ry="6"/>
    <ellipse cx="1120" cy="842" rx="12" ry="6"/>
  </g>
</svg>`;
