// The bathroom without the washing machine: a laundry basket stands where the other one has it.
// Otherwise the two bathrooms are twins. Rule 3 says: lock yourself in THIS one.
// Clickable things have data-hotspot="...", the same names as in story.js.
ROOMS["bath"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bath-light">
      <stop offset="0" style="stop-color: var(--glow)" stop-opacity="0.45"/>
      <stop offset="1" style="stop-color: var(--glow)" stop-opacity="0"/>
    </radialGradient>
    <pattern id="bath-tiles" x="400" y="160" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect width="60" height="2" fill="var(--void)" opacity="0.3"/>
      <rect width="2" height="60" fill="var(--void)" opacity="0.3"/>
    </pattern>
    <path id="bath-sock" d="M0,0 L12,0 L12,24 Q12,30 18,30 L30,30 Q36,30 36,36 Q36,42 30,42 L8,42 Q0,42 0,34 Z"/>
  </defs>

  <!-- the room: back wall, ceiling, floor and the two side walls -->
  <rect width="1600" height="900" fill="var(--wall)"/>
  <polygon points="0,0 1600,0 1200,160 400,160" fill="var(--void)" opacity="0.55"/>
  <polygon points="0,900 1600,900 1200,640 400,640" fill="var(--void)" opacity="0.4"/>
  <polygon points="0,0 400,160 400,640 0,900" fill="var(--void)" opacity="0.25"/>
  <polygon points="1600,0 1200,160 1200,640 1600,900" fill="var(--void)" opacity="0.25"/>
  <!-- tiles everywhere -->
  <rect x="400" y="160" width="800" height="480" fill="url(#bath-tiles)"/>
  <g fill="var(--void)" opacity="0.22">
    <polygon points="0,112 400,220 400,222 0,116"/><polygon points="0,225 400,280 400,282 0,229"/>
    <polygon points="0,337 400,340 400,342 0,341"/><polygon points="0,450 400,400 400,402 0,454"/>
    <polygon points="0,562 400,460 400,462 0,566"/><polygon points="0,675 400,520 400,522 0,679"/>
    <polygon points="0,787 400,580 400,582 0,791"/>
    <polygon points="1600,112 1200,220 1200,222 1600,116"/><polygon points="1600,225 1200,280 1200,282 1600,229"/>
    <polygon points="1600,337 1200,340 1200,342 1600,341"/><polygon points="1600,450 1200,400 1200,402 1600,454"/>
    <polygon points="1600,562 1200,460 1200,462 1600,566"/><polygon points="1600,675 1200,520 1200,522 1600,679"/>
    <polygon points="1600,787 1200,580 1200,582 1600,791"/>
    <rect x="368" y="147" width="2" height="513"/><rect x="138" y="55" width="3" height="755"/>
    <rect x="1230" y="148" width="2" height="513"/><rect x="1459" y="55" width="3" height="755"/>
  </g>
  <!-- ceiling light, and the bath mat -->
  <ellipse cx="800" cy="104" rx="56" ry="13" fill="var(--furniture)"/>
  <ellipse cx="800" cy="100" rx="38" ry="6" fill="var(--accent)" opacity="0.5"/>
  <polygon points="1160,676 1255,676 1375,754 1257,754" fill="var(--accent)" opacity="0.3"/>

  <!-- the bathroom door (left wall): closed, and it's the only way in -->
  <polygon points="175,163 345,208 345,676 175,786" fill="var(--accent)" opacity="0.5"/>
  <polygon points="187,174 333,213 333,683 187,778" fill="var(--furniture)"/>
  <polygon points="205,219 318,240 318,382 205,390" fill="var(--void)" opacity="0.25"/>
  <polygon points="205,459 318,439 318,625 205,685" fill="var(--void)" opacity="0.25"/>
  <g data-name="hall-glow" data-hide-if="dark">
    <polygon points="187,774 333,679 333,684 187,779" fill="var(--glow)" opacity="0.35"/>
  </g>

  <!-- the lock: a big sliding bolt, and the door handle under it -->
  <g data-hotspot="lock">
    <rect x="252" y="336" width="96" height="108" fill="var(--void)" opacity="0"/>
    <rect x="262" y="358" width="58" height="22" rx="3" fill="var(--accent)"/>
    <rect x="296" y="363" width="50" height="12" rx="4" fill="var(--accent)"/>
    <rect x="334" y="355" width="12" height="28" rx="2" fill="var(--accent)" opacity="0.8"/>
    <rect x="276" y="344" width="8" height="20" rx="3" fill="var(--accent)"/>
    <circle cx="280" cy="344" r="7" fill="var(--accent)"/>
    <rect x="262" y="376" width="58" height="4" fill="var(--void)" opacity="0.4"/>
    <circle cx="318" cy="414" r="10" fill="var(--accent)"/>
    <rect x="270" y="409" width="50" height="10" rx="5" fill="var(--accent)"/>
  </g>

  <!-- mirror over the sink, and its light while the lights still work -->
  <g data-name="light-glow" data-hide-if="dark">
    <circle cx="560" cy="226" r="210" fill="url(#bath-light)"/>
  </g>
  <rect x="500" y="208" width="120" height="10" rx="5" fill="var(--accent)"/>
  <g data-hotspot="mirror">
    <rect x="466" y="232" width="188" height="206" rx="6" fill="var(--furniture)"/>
    <rect x="476" y="242" width="168" height="186" rx="3" fill="var(--accent)" opacity="0.45"/>
    <polygon points="520,242 546,242 492,428 476,428 476,396" fill="var(--glow)" opacity="0.06"/>
    <polygon points="602,242 614,242 562,428 550,428" fill="var(--glow)" opacity="0.05"/>
  </g>

  <!-- the sink: cupboard, basin, tap, toothbrushes, toothpaste -->
  <g data-hotspot="sink">
    <rect x="450" y="500" width="220" height="140" fill="var(--furniture)"/>
    <rect x="462" y="516" width="94" height="112" fill="var(--void)" opacity="0.25"/>
    <rect x="564" y="516" width="94" height="112" fill="var(--void)" opacity="0.25"/>
    <rect x="546" y="560" width="5" height="18" rx="2" fill="var(--accent)"/>
    <rect x="569" y="560" width="5" height="18" rx="2" fill="var(--accent)"/>
    <rect x="442" y="490" width="236" height="12" fill="var(--accent)"/>
    <ellipse cx="560" cy="494" rx="58" ry="5" fill="var(--void)" opacity="0.5"/>
    <path d="M554,490 L554,464 Q554,454 564,454 L584,454 L584,462 L566,462 Q562,462 562,466 L562,490 Z" fill="var(--accent)"/>
    <rect x="464" y="462" width="22" height="28" rx="3" fill="var(--accent)" opacity="0.8"/>
    <rect x="467" y="440" width="4" height="26" rx="2" fill="var(--accent)" transform="rotate(-12 469 462)"/>
    <rect x="477" y="442" width="4" height="24" rx="2" fill="var(--glow)" opacity="0.45" transform="rotate(10 479 462)"/>
    <rect x="606" y="480" width="44" height="10" rx="4" fill="var(--accent)" opacity="0.9"/>
    <rect x="648" y="482" width="10" height="6" rx="2" fill="var(--glow)" opacity="0.4"/>
  </g>

  <!-- shelf with towels and a big bottle of shampoo -->
  <rect x="788" y="326" width="184" height="8" fill="var(--accent)" opacity="0.75"/>
  <rect x="806" y="334" width="6" height="14" fill="var(--furniture)"/>
  <rect x="948" y="334" width="6" height="14" fill="var(--furniture)"/>
  <rect x="800" y="310" width="78" height="16" rx="5" fill="var(--furniture)"/>
  <rect x="804" y="296" width="70" height="14" rx="5" fill="var(--accent)" opacity="0.55"/>
  <rect x="808" y="284" width="62" height="12" rx="5" fill="var(--furniture)"/>
  <rect x="916" y="284" width="32" height="42" rx="6" fill="var(--accent)" opacity="0.7"/>
  <rect x="925" y="274" width="14" height="12" rx="2" fill="var(--accent)"/>

  <!-- the laundry basket, where the other bathroom has its washing machine -->
  <g data-hotspot="basket">
    <path d="M812,498 Q816,474 842,478 Q850,456 878,464 Q902,448 920,470 Q944,470 948,498 Z" fill="var(--accent)" opacity="0.55"/>
    <polygon points="812,500 948,500 934,640 826,640" fill="var(--furniture)"/>
    <g fill="var(--accent)" opacity="0.3">
      <rect x="815" y="528" width="130" height="5"/>
      <rect x="818" y="558" width="124" height="5"/>
      <rect x="821" y="588" width="118" height="5"/>
      <rect x="824" y="616" width="112" height="5"/>
    </g>
    <g fill="var(--void)" opacity="0.25">
      <rect x="846" y="506" width="3" height="134"/>
      <rect x="878" y="506" width="3" height="134"/>
      <rect x="910" y="506" width="3" height="134"/>
    </g>
    <rect x="806" y="494" width="148" height="12" rx="5" fill="var(--accent)"/>
    <!-- a sleeve and a sock hanging out, and more socks on the floor -->
    <polygon points="816,496 842,496 832,566 812,560" fill="var(--accent)" opacity="0.65"/>
    <use href="#bath-sock" transform="translate(938 492)" fill="var(--accent)" opacity="0.9"/>
    <use href="#bath-sock" transform="translate(962 664) rotate(-90) scale(0.8)" fill="var(--accent)" opacity="0.7"/>
    <use href="#bath-sock" transform="translate(744 676) rotate(-110) scale(0.8)" fill="var(--glow)" opacity="0.3"/>
  </g>

  <!-- towel ladder -->
  <rect x="1058" y="292" width="7" height="318" fill="var(--furniture)"/>
  <rect x="1138" y="292" width="7" height="318" fill="var(--furniture)"/>
  <g fill="var(--accent)" opacity="0.6">
    <rect x="1058" y="320" width="87" height="5"/><rect x="1058" y="372" width="87" height="5"/>
    <rect x="1058" y="424" width="87" height="5"/><rect x="1058" y="476" width="87" height="5"/>
    <rect x="1058" y="528" width="87" height="5"/><rect x="1058" y="580" width="87" height="5"/>
  </g>
  <rect x="1068" y="318" width="68" height="150" rx="4" fill="var(--accent)" opacity="0.5"/>
  <rect x="1068" y="318" width="68" height="10" rx="4" fill="var(--accent)" opacity="0.6"/>
  <rect x="1068" y="444" width="68" height="6" fill="var(--void)" opacity="0.25"/>

  <!-- the shower (right wall), curtain pulled to one side -->
  <g data-hotspot="shower">
    <polygon points="1225,185 1405,127 1405,766 1225,651" fill="var(--furniture)"/>
    <polygon points="1235,192 1395,144 1395,746 1235,647" fill="var(--void)" opacity="0.5"/>
    <g fill="var(--accent)" opacity="0.15">
      <polygon points="1235,325 1395,315 1395,318 1235,328"/>
      <polygon points="1235,428 1395,445 1395,448 1235,431"/>
      <polygon points="1235,532 1395,582 1395,585 1235,535"/>
    </g>
    <polygon points="1235,627 1395,719 1395,746 1235,647" fill="var(--accent)" opacity="0.5"/>
    <rect x="1268" y="180" width="6" height="62" fill="var(--accent)"/>
    <ellipse cx="1271" cy="246" rx="24" ry="7" fill="var(--accent)"/>
    <rect x="1262" y="398" width="18" height="24" rx="4" fill="var(--accent)" opacity="0.8"/>
    <rect x="1250" y="404" width="16" height="6" rx="3" fill="var(--accent)" opacity="0.8"/>
    <g fill="var(--glow)" opacity="0.4">
      <ellipse cx="1266" cy="290" rx="2.5" ry="5"/>
      <ellipse cx="1276" cy="372" rx="2.5" ry="5"/>
      <ellipse cx="1270" cy="488" rx="2.5" ry="5"/>
      <ellipse cx="1272" cy="664" rx="14" ry="3"/>
    </g>
    <polygon points="1222,199 1408,145 1408,151 1222,205" fill="var(--accent)"/>
    <polygon points="1322,182 1402,159 1402,722 1322,676" fill="var(--accent)" opacity="0.75"/>
    <g fill="var(--void)" opacity="0.3">
      <polygon points="1336,178 1344,176 1344,684 1336,680"/>
      <polygon points="1358,172 1366,170 1366,697 1358,693"/>
      <polygon points="1380,165 1388,163 1388,710 1380,706"/>
    </g>
    <g fill="var(--accent)">
      <circle cx="1330" cy="174" r="4"/><circle cx="1350" cy="168" r="4"/>
      <circle cx="1370" cy="162" r="4"/><circle cx="1390" cy="156" r="4"/>
    </g>
  </g>
</svg>`;
