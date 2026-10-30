// Your own room: your bed, your desk, the scary book covers on the wall, and a window on the city.
// The door to the hallway is on the left. Same perspective and colors as the living room.
// Clickable things have data-hotspot="...", the same names as in story.js.
ROOMS["my-room"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="my-room-lamp-light">
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
  <polygon points="690,668 950,668 1000,744 640,744" fill="var(--accent)" opacity="0.3"/>

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

  <!-- posters: your favorite book covers. A haunted house, an eye, a ghost. -->
  <g data-hotspot="posters">
    <g transform="rotate(-2 480 276)">
      <rect x="432" y="208" width="96" height="136" fill="var(--accent)"/>
      <rect x="440" y="216" width="80" height="14" fill="var(--void)" opacity="0.5"/>
      <circle cx="506" cy="254" r="12" fill="var(--glow)" opacity="0.5"/>
      <polygon points="446,336 446,300 468,282 490,300 490,290 498,268 506,290 506,336" fill="var(--void)" opacity="0.75"/>
      <rect x="463" y="308" width="9" height="11" fill="var(--glow)" opacity="0.7"/>
      <circle cx="480" cy="212" r="4" fill="var(--glow)" opacity="0.6"/>
    </g>
    <g transform="rotate(3 597 269)">
      <rect x="548" y="200" width="98" height="138" fill="var(--furniture)"/>
      <rect x="548" y="200" width="98" height="5" fill="var(--accent)"/>
      <path d="M558,264 Q597,232 636,264 Q597,296 558,264 Z" fill="var(--glow)" opacity="0.35"/>
      <circle cx="597" cy="264" r="15" fill="var(--accent)"/>
      <ellipse cx="597" cy="264" rx="3" ry="11" fill="var(--void)"/>
      <rect x="560" y="306" width="74" height="12" fill="var(--glow)" opacity="0.45"/>
      <g fill="var(--glow)" opacity="0.45">
        <rect x="568" y="318" width="4" height="9" rx="2"/>
        <rect x="590" y="318" width="4" height="6" rx="2"/>
        <rect x="619" y="318" width="4" height="11" rx="2"/>
      </g>
      <circle cx="597" cy="204" r="4" fill="var(--glow)" opacity="0.6"/>
    </g>
    <g transform="rotate(-1 536 400)">
      <rect x="476" y="358" width="120" height="86" fill="var(--accent)" opacity="0.8"/>
      <rect x="484" y="366" width="104" height="10" fill="var(--void)" opacity="0.45"/>
      <path d="M514,436 L514,404 Q514,384 534,384 Q554,384 554,404 L554,436 L547,430 L541,436 L534,430 L527,436 L520,430 Z" fill="var(--glow)" opacity="0.4"/>
      <ellipse cx="527" cy="402" rx="3" ry="5" fill="var(--void)"/>
      <ellipse cx="541" cy="402" rx="3" ry="5" fill="var(--void)"/>
      <polygon points="566,394 574,390 580,396 586,390 594,394 584,400 580,398 576,400" fill="var(--void)" opacity="0.6"/>
      <circle cx="536" cy="362" r="4" fill="var(--glow)" opacity="0.6"/>
    </g>
  </g>

  <!-- the desk with your homework, and the chair pushed in -->
  <g data-hotspot="desk">
    <rect x="428" y="506" width="104" height="134" fill="var(--furniture)"/>
    <rect x="436" y="516" width="88" height="36" fill="var(--void)" opacity="0.25"/>
    <rect x="436" y="560" width="88" height="36" fill="var(--void)" opacity="0.25"/>
    <rect x="436" y="604" width="88" height="30" fill="var(--void)" opacity="0.25"/>
    <rect x="470" y="530" width="20" height="5" rx="2" fill="var(--accent)"/>
    <rect x="470" y="574" width="20" height="5" rx="2" fill="var(--accent)"/>
    <rect x="470" y="616" width="20" height="5" rx="2" fill="var(--accent)"/>
    <rect x="532" y="506" width="140" height="134" fill="var(--void)" opacity="0.2"/>
    <rect x="672" y="506" width="12" height="134" fill="var(--furniture)"/>
    <rect x="420" y="494" width="272" height="12" fill="var(--accent)"/>
    <rect x="438" y="482" width="64" height="12" fill="var(--furniture)"/>
    <rect x="442" y="472" width="56" height="10" fill="var(--accent)" opacity="0.8"/>
    <rect x="440" y="462" width="60" height="10" fill="var(--furniture)"/>
    <polygon points="520,494 528,484 590,484 586,494" fill="var(--glow)" opacity="0.45"/>
    <rect x="534" y="488" width="40" height="2" fill="var(--void)" opacity="0.4"/>
    <rect x="556" y="486" width="34" height="3" fill="var(--accent)" transform="rotate(-8 573 487)"/>
    <rect x="592" y="516" width="10" height="126" fill="var(--furniture)"/>
    <rect x="552" y="452" width="90" height="70" rx="16" fill="var(--furniture)"/>
    <rect x="560" y="452" width="74" height="6" rx="3" fill="var(--accent)" opacity="0.6"/>
    <rect x="538" y="532" width="118" height="16" rx="7" fill="var(--furniture)"/>
    <rect x="556" y="642" width="82" height="8" rx="4" fill="var(--furniture)"/>
    <circle cx="560" cy="654" r="6" fill="var(--void)" opacity="0.7"/>
    <circle cx="634" cy="654" r="6" fill="var(--void)" opacity="0.7"/>
  </g>

  <!-- desk lamp, and its light while the lights still work -->
  <g data-name="lamp-glow" data-light-only>
    <circle cx="640" cy="440" r="180" fill="url(#my-room-lamp-light)"/>
  </g>
  <ellipse cx="660" cy="492" rx="18" ry="4" fill="var(--furniture)"/>
  <rect x="657" y="436" width="6" height="56" fill="var(--furniture)" transform="rotate(10 660 492)"/>
  <polygon points="612,428 660,416 668,436 622,450" fill="var(--accent)"/>

  <!-- the window: the other buildings, most of their windows dark -->
  <g data-hotspot="window">
    <rect x="698" y="198" width="244" height="244" fill="var(--furniture)"/>
    <rect x="710" y="210" width="220" height="220" fill="var(--accent)" opacity="0.45"/>
    <rect x="710" y="350" width="48" height="80" fill="var(--void)" opacity="0.6"/>
    <rect x="778" y="322" width="60" height="108" fill="var(--void)" opacity="0.6"/>
    <rect x="865" y="362" width="65" height="68" fill="var(--void)" opacity="0.6"/>
    <rect x="726" y="372" width="7" height="9" fill="var(--glow)" opacity="0.7"/>
    <rect x="816" y="392" width="7" height="9" fill="var(--glow)" opacity="0.8"/>
    <rect x="906" y="404" width="7" height="8" fill="var(--glow)" opacity="0.6"/>
    <polygon points="750,210 780,210 728,430 710,430 710,380" fill="var(--glow)" opacity="0.06"/>
    <polygon points="860,210 876,210 830,430 814,430" fill="var(--glow)" opacity="0.05"/>
    <rect x="817" y="210" width="6" height="220" fill="var(--furniture)"/>
    <rect x="690" y="440" width="260" height="10" fill="var(--accent)"/>
  </g>

  <!-- the face in the window (rule 3). Far away first... -->
  <g data-name="face" data-hidden>
    <ellipse cx="872" cy="300" rx="30" ry="40" fill="var(--skin)" opacity="0.55"/>
    <ellipse cx="861" cy="294" rx="5" ry="8" fill="var(--void)"/>
    <ellipse cx="883" cy="294" rx="5" ry="8" fill="var(--void)"/>
    <rect x="863" y="318" width="18" height="3" fill="var(--void)" opacity="0.8"/>
  </g>
  <!-- ...then pressed right against the glass -->
  <g data-name="face-close" data-hidden data-scare>
    <ellipse cx="820" cy="306" rx="50" ry="88" fill="var(--skin)"/>
    <ellipse cx="801" cy="290" rx="9" ry="15" fill="var(--void)"/>
    <ellipse cx="839" cy="292" rx="9" ry="13" fill="var(--void)"/>
    <ellipse cx="820" cy="352" rx="28" ry="4" fill="var(--void)" opacity="0.85"/>
    <g fill="var(--skin)" opacity="0.92">
      <rect x="726" y="352" width="44" height="54" rx="12"/>
      <rect x="726" y="318" width="9" height="40" rx="4"/>
      <rect x="738" y="310" width="9" height="46" rx="4"/>
      <rect x="750" y="312" width="9" height="44" rx="4"/>
      <rect x="762" y="322" width="8" height="36" rx="4"/>
      <rect x="870" y="352" width="44" height="54" rx="12"/>
      <rect x="870" y="322" width="8" height="36" rx="4"/>
      <rect x="881" y="312" width="9" height="44" rx="4"/>
      <rect x="893" y="310" width="9" height="46" rx="4"/>
      <rect x="905" y="318" width="9" height="40" rx="4"/>
    </g>
  </g>

  <!-- a shelf of books on the right wall -->
  <polygon points="1236,363 1416,370 1416,388 1236,376" fill="var(--furniture)"/>
  <polygon points="1252,305 1268,304 1268,364 1252,364" fill="var(--accent)"/>
  <polygon points="1270,315 1284,314 1284,365 1270,364" fill="var(--furniture)"/>
  <polygon points="1286,291 1306,289 1306,366 1286,365" fill="var(--accent)"/>
  <polygon points="1308,316 1320,315 1320,367 1308,366" fill="var(--furniture)"/>
  <polygon points="1322,294 1340,292 1340,367 1322,367" fill="var(--accent)" opacity="0.8"/>
  <polygon points="1346,312 1362,300 1396,362 1380,370" fill="var(--furniture)"/>

  <!-- your bed in the corner, with a book you didn't finish. Nothing under it. Probably. -->
  <g data-hotspot="bed">
    <polygon points="975,640 1200,640 1382,746 1052,746" fill="var(--void)" opacity="0.35"/>
    <rect x="972" y="466" width="228" height="112" rx="8" fill="var(--furniture)"/>
    <rect x="972" y="466" width="228" height="7" rx="3" fill="var(--accent)" opacity="0.6"/>
    <rect x="988" y="484" width="94" height="80" rx="6" fill="var(--void)" opacity="0.2"/>
    <rect x="1092" y="484" width="94" height="80" rx="6" fill="var(--void)" opacity="0.2"/>
    <polygon points="975,572 1052,646 1052,718 975,624" fill="var(--furniture)"/>
    <polygon points="975,572 1200,572 1382,646 1052,646" fill="var(--glow)" opacity="0.14"/>
    <rect x="1012" y="574" width="156" height="24" rx="11" fill="var(--accent)"/>
    <rect x="1012" y="574" width="156" height="24" rx="11" fill="var(--glow)" opacity="0.15"/>
    <polygon points="994,598 1262,598 1382,646 1052,646" fill="var(--accent)"/>
    <polygon points="994,598 1262,598 1270,605 1000,605" fill="var(--glow)" opacity="0.2"/>
    <polygon points="994,598 1052,646 1052,704 990,648" fill="var(--accent)"/>
    <polygon points="994,598 1052,646 1052,704 990,648" fill="var(--void)" opacity="0.3"/>
    <rect x="1052" y="646" width="330" height="54" fill="var(--accent)"/>
    <rect x="1052" y="646" width="330" height="54" fill="var(--void)" opacity="0.15"/>
    <rect x="1052" y="698" width="330" height="20" fill="var(--furniture)"/>
    <rect x="1056" y="716" width="12" height="30" fill="var(--furniture)"/>
    <rect x="1366" y="716" width="12" height="30" fill="var(--furniture)"/>
    <polygon points="1180,620 1216,612 1224,630 1186,638" fill="var(--glow)" opacity="0.4"/>
    <polygon points="1216,612 1254,618 1258,636 1224,630" fill="var(--glow)" opacity="0.32"/>
  </g>

  <!-- your school bag, leaning on the desk -->
  <rect x="372" y="602" width="58" height="72" rx="14" fill="var(--accent)" opacity="0.85"/>
  <rect x="382" y="636" width="38" height="26" rx="6" fill="var(--void)" opacity="0.25"/>
  <rect x="388" y="590" width="26" height="16" rx="8" fill="var(--furniture)"/>
</svg>`;
