// The title screen: your apartment building at night. Every window is dark except one.
// The game's name and the Start button are drawn on top of this, in the middle, so keep the middle calm.
// Nothing here is clickable.
ROOMS["title"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="title-window-light">
      <stop offset="0" style="stop-color: var(--glow)" stop-opacity="0.4"/>
      <stop offset="1" style="stop-color: var(--glow)" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="title-moon-light">
      <stop offset="0" style="stop-color: var(--glow)" stop-opacity="0.12"/>
      <stop offset="1" style="stop-color: var(--glow)" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="title-city-light">
      <stop offset="0" style="stop-color: var(--accent)" stop-opacity="0.45"/>
      <stop offset="1" style="stop-color: var(--accent)" stop-opacity="0"/>
    </radialGradient>
    <!-- one window, repeated across a whole wall -->
    <pattern id="title-windows" width="100" height="120" patternUnits="userSpaceOnUse">
      <rect x="22" y="24" width="56" height="72" fill="var(--void)" opacity="0.7"/>
      <rect x="18" y="96" width="64" height="6" fill="var(--accent)" opacity="0.35"/>
    </pattern>
    <pattern id="title-windows-small" width="80" height="96" patternUnits="userSpaceOnUse">
      <rect x="18" y="20" width="44" height="56" fill="var(--void)" opacity="0.7"/>
    </pattern>
    <!-- one fence post, repeated along the street -->
    <pattern id="title-fence" width="30" height="70" patternUnits="userSpaceOnUse">
      <polygon points="0,8 5,0 10,8 10,70 0,70" fill="var(--void)"/>
    </pattern>
  </defs>

  <!-- night sky, the city's glow low down, a moon behind thin clouds, and two bats -->
  <rect width="1600" height="900" fill="var(--void)"/>
  <ellipse cx="800" cy="900" rx="1000" ry="480" fill="url(#title-city-light)"/>
  <circle cx="430" cy="150" r="190" fill="url(#title-moon-light)"/>
  <circle cx="430" cy="150" r="50" fill="var(--glow)" opacity="0.2"/>
  <g fill="var(--wall)" opacity="0.95">
    <circle cx="452" cy="192" r="24"/><circle cx="486" cy="176" r="34"/><circle cx="526" cy="186" r="26"/>
    <circle cx="558" cy="196" r="18"/><rect x="420" y="192" width="160" height="22" rx="11"/>
  </g>
  <g fill="var(--void)">
    <path d="M610,120 Q620,108 630,118 L634,112 L638,118 Q648,108 658,120 Q646,116 634,126 Q622,116 610,120 Z"/>
    <path d="M690,170 Q697,162 704,169 L707,165 L710,169 Q717,162 724,170 Q716,167 707,174 Q698,167 690,170 Z"/>
  </g>

  <!-- the city far away -->
  <g fill="var(--wall)" opacity="0.8">
    <rect x="540" y="560" width="90" height="340"/>
    <rect x="620" y="610" width="70" height="290"/>
    <rect x="690" y="520" width="80" height="380"/>
    <rect x="770" y="590" width="110" height="310"/>
    <rect x="870" y="630" width="80" height="270"/>
    <rect x="720" y="490" width="6" height="30"/>
  </g>

  <!-- the building next door -->
  <rect x="120" y="330" width="400" height="570" fill="var(--wall)"/>
  <rect x="120" y="330" width="400" height="570" fill="url(#title-windows-small)"/>
  <polygon points="520,330 580,352 580,900 520,900" fill="var(--wall)"/>
  <polygon points="520,330 580,352 580,900 520,900" fill="var(--void)" opacity="0.45"/>
  <rect x="112" y="320" width="416" height="12" fill="var(--furniture)"/>

  <!-- your building: water tank and TV antenna on the roof -->
  <polygon points="920,150 1000,112 1000,900 920,900" fill="var(--wall)"/>
  <polygon points="920,150 1000,112 1000,900 920,900" fill="var(--void)" opacity="0.3"/>
  <rect x="1000" y="110" width="500" height="790" fill="var(--furniture)"/>
  <rect x="1000" y="110" width="500" height="790" fill="var(--void)" opacity="0.25"/>
  <rect x="1000" y="130" width="500" height="770" fill="url(#title-windows)"/>
  <rect x="990" y="100" width="520" height="14" fill="var(--accent)" opacity="0.5"/>
  <rect x="1080" y="40" width="80" height="50" rx="6" fill="var(--furniture)"/>
  <rect x="1090" y="88" width="6" height="14" fill="var(--furniture)"/>
  <rect x="1144" y="88" width="6" height="14" fill="var(--furniture)"/>
  <g fill="var(--furniture)">
    <rect x="1438" y="24" width="4" height="78"/>
    <rect x="1430" y="34" width="20" height="3"/>
    <rect x="1424" y="46" width="32" height="3"/>
    <rect x="1418" y="58" width="44" height="3"/>
  </g>
  <!-- the front door downstairs, with its lamp -->
  <rect x="1200" y="800" width="100" height="100" fill="var(--void)"/>
  <rect x="1208" y="808" width="40" height="92" fill="var(--accent)" opacity="0.35"/>
  <rect x="1252" y="808" width="40" height="92" fill="var(--accent)" opacity="0.35"/>
  <rect x="1240" y="784" width="20" height="8" rx="3" fill="var(--glow)" opacity="0.5"/>

  <!-- the one lit window. Somebody is standing in it. -->
  <g data-name="lit-window">
    <circle cx="1350" cy="310" r="150" fill="url(#title-window-light)"/>
    <rect x="1322" y="274" width="56" height="72" fill="var(--glow)" opacity="0.85"/>
    <rect x="1322" y="274" width="12" height="72" fill="var(--furniture)" opacity="0.7"/>
    <rect x="1366" y="274" width="12" height="72" fill="var(--furniture)" opacity="0.7"/>
    <circle cx="1350" cy="300" r="8" fill="var(--void)" opacity="0.8"/>
    <polygon points="1342,310 1358,310 1364,346 1336,346" fill="var(--void)" opacity="0.8"/>
  </g>

  <!-- a bare tree in front -->
  <g fill="var(--void)">
    <path d="M120,900 L168,640 Q178,560 160,470 L184,468 Q204,560 198,650 L236,900 Z"/>
    <polygon points="166,560 40,430 50,422 176,546"/>
    <polygon points="70,460 20,470 22,462 66,452"/>
    <polygon points="172,500 96,300 106,296 184,494"/>
    <polygon points="118,356 70,330 74,322 122,346"/>
    <polygon points="180,480 236,280 246,284 190,486"/>
    <polygon points="220,340 300,300 304,308 224,350"/>
    <polygon points="186,600 330,520 334,528 192,612"/>
    <polygon points="290,546 320,580 314,584 284,552"/>
    <polygon points="162,470 150,380 158,378 172,468"/>
  </g>

  <!-- the fence along the street -->
  <rect width="1600" height="70" fill="url(#title-fence)" transform="translate(0 820)"/>
  <rect y="836" width="1600" height="6" fill="var(--void)"/>
  <rect y="866" width="1600" height="6" fill="var(--void)"/>
  <rect y="886" width="1600" height="14" fill="var(--void)"/>
</svg>`;
