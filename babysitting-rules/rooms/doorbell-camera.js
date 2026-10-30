// The doorbell's video screen, opened up close. It glows by itself, even in the dark.
// The camera shows the building's front door downstairs (feed-empty, feed-mom)... or something else (feed-hallway).
// The two buttons you can click are in index.html: their parts here have data-name="talk" and "open".
ROOMS["doorbell-camera"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="doorbell-camera-screen"><rect x="200" y="96" width="980" height="628" rx="10"/></clipPath>
    <pattern id="doorbell-camera-lines" width="12" height="6" patternUnits="userSpaceOnUse"><rect width="12" height="2" fill="var(--void)" opacity="0.45"/></pattern>
    <filter id="doorbell-camera-noise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>

    <!-- the building's front door at night, as the camera sees it. Used twice below. -->
    <g id="doorbell-camera-street">
      <rect x="200" y="96" width="980" height="628" fill="var(--void)"/>
      <!-- the building's wall, the sidewalk and the curb -->
      <rect x="200" y="96" width="980" height="520" fill="var(--skin)" opacity="0.07"/>
      <rect x="200" y="616" width="980" height="108" fill="var(--skin)" opacity="0.1"/>
      <rect x="200" y="690" width="980" height="4" fill="var(--void)" opacity="0.5"/>
      <!-- dark windows on both sides -->
      <rect x="244" y="272" width="164" height="212" fill="var(--skin)" opacity="0.14"/>
      <rect x="254" y="282" width="144" height="192" fill="var(--void)" opacity="0.75"/>
      <rect x="984" y="272" width="164" height="212" fill="var(--skin)" opacity="0.14"/>
      <rect x="994" y="282" width="144" height="192" fill="var(--void)" opacity="0.75"/>
      <!-- the glass doors, and the empty lobby behind them with its mailboxes -->
      <rect x="548" y="232" width="296" height="384" fill="var(--skin)" opacity="0.3"/>
      <rect x="562" y="246" width="268" height="40" fill="var(--skin)" opacity="0.18"/>
      <rect x="562" y="298" width="128" height="318" fill="var(--skin)" opacity="0.2"/>
      <rect x="702" y="298" width="128" height="318" fill="var(--skin)" opacity="0.2"/>
      <g fill="var(--void)" opacity="0.35">
        <rect x="578" y="352" width="26" height="18"/><rect x="608" y="352" width="26" height="18"/><rect x="638" y="352" width="26" height="18"/>
        <rect x="578" y="374" width="26" height="18"/><rect x="608" y="374" width="26" height="18"/><rect x="638" y="374" width="26" height="18"/>
        <rect x="562" y="556" width="268" height="4"/>
      </g>
      <polygon points="610,298 650,298 574,560 562,560 562,460" fill="var(--skin)" opacity="0.08"/>
      <polygon points="770,298 792,298 720,600 702,600" fill="var(--skin)" opacity="0.07"/>
      <rect x="574" y="446" width="104" height="9" rx="4" fill="var(--skin)" opacity="0.55"/>
      <rect x="714" y="446" width="104" height="9" rx="4" fill="var(--skin)" opacity="0.55"/>
      <!-- the steps -->
      <rect x="520" y="616" width="352" height="26" fill="var(--skin)" opacity="0.22"/>
      <rect x="490" y="642" width="412" height="28" fill="var(--skin)" opacity="0.15"/>
      <!-- the little roof over the door, its lamp, and the lamp's light -->
      <polygon points="680,222 712,222 930,670 462,670" fill="var(--skin)" opacity="0.05"/>
      <ellipse cx="696" cy="652" rx="230" ry="22" fill="var(--skin)" opacity="0.08"/>
      <rect x="500" y="186" width="392" height="22" fill="var(--skin)" opacity="0.28"/>
      <rect x="500" y="208" width="392" height="6" fill="var(--void)" opacity="0.5"/>
      <rect x="680" y="214" width="32" height="8" fill="var(--skin)" opacity="0.45"/>
      <ellipse cx="696" cy="224" rx="16" ry="6" fill="var(--skin)" opacity="0.95"/>
      <!-- house number and bushes -->
      <rect x="866" y="244" width="46" height="32" rx="4" fill="var(--skin)" opacity="0.32"/>
      <text x="889" y="268" text-anchor="middle" font-size="22" font-weight="700" fill="var(--void)">12</text>
      <g fill="var(--void)" opacity="0.65">
        <circle cx="260" cy="604" r="60"/><circle cx="340" cy="584" r="72"/><circle cx="430" cy="612" r="50"/>
        <circle cx="962" cy="612" r="50"/><circle cx="1050" cy="584" r="72"/><circle cx="1130" cy="604" r="60"/>
        <rect x="200" y="604" width="280" height="60"/><rect x="912" y="604" width="268" height="60"/>
      </g>
    </g>
  </defs>

  <!-- the doorbell screen, close up: the wall around it and the plastic box -->
  <rect width="1600" height="900" fill="var(--void)"/>
  <rect width="1600" height="900" fill="var(--wall)" opacity="0.6"/>
  <rect x="140" y="40" width="1320" height="820" rx="44" fill="var(--furniture)"/>
  <rect x="180" y="50" width="1240" height="5" rx="2" fill="var(--accent)" opacity="0.5"/>
  <rect x="140" y="780" width="1320" height="80" rx="40" fill="var(--void)" opacity="0.2"/>
  <rect x="180" y="76" width="1020" height="668" rx="20" fill="var(--void)"/>
  <rect x="190" y="86" width="1000" height="648" rx="16" fill="var(--skin)" opacity="0.05"/>

  <!-- what the camera sees (clipped to the screen) -->
  <g clip-path="url(#doorbell-camera-screen)">
    <!-- nobody there -->
    <g data-name="feed-empty">
      <use href="#doorbell-camera-street"/>
    </g>

    <!-- "Mom", waving at the camera. Too still. Her face is too pale. And she has no shadow. -->
    <g data-name="feed-mom" data-hidden>
      <use href="#doorbell-camera-street"/>
      <g fill="var(--void)" opacity="0.85">
        <path d="M690,360 Q688,316 716,314 Q744,316 742,360 L746,384 L686,384 Z"/>
        <polygon points="740,402 754,390 796,312 782,302"/>
        <rect x="666" y="398" width="15" height="136" rx="7"/>
        <rect x="696" y="538" width="13" height="88"/>
        <rect x="724" y="538" width="13" height="88"/>
        <rect x="650" y="496" width="28" height="34" rx="4"/>
      </g>
      <polygon points="688,390 744,390 764,542 668,542" fill="var(--void)"/>
      <polygon points="688,390 744,390 764,542 668,542" fill="var(--skin)" opacity="0.2"/>
      <polygon points="700,390 716,410 732,390" fill="var(--skin)" opacity="0.3"/>
      <rect x="676" y="462" width="80" height="6" fill="var(--void)" opacity="0.35"/>
      <rect x="710" y="376" width="12" height="16" fill="var(--skin)" opacity="0.7"/>
      <ellipse cx="716" cy="354" rx="21" ry="27" fill="var(--skin)"/>
      <ellipse cx="708" cy="350" rx="4" ry="6" fill="var(--void)"/>
      <ellipse cx="724" cy="350" rx="4" ry="6" fill="var(--void)"/>
      <rect x="709" y="368" width="14" height="2.5" fill="var(--void)" opacity="0.6"/>
      <g fill="var(--skin)" opacity="0.9">
        <ellipse cx="673" cy="538" rx="8" ry="10"/>
        <ellipse cx="790" cy="294" rx="12" ry="15"/>
        <rect x="779" y="264" width="5" height="24" rx="2.5"/>
        <rect x="786" y="258" width="5" height="28" rx="2.5"/>
        <rect x="793" y="260" width="5" height="26" rx="2.5"/>
        <rect x="800" y="268" width="5" height="22" rx="2.5"/>
        <rect x="768" y="290" width="12" height="5" rx="2.5" transform="rotate(-30 774 292)"/>
      </g>
    </g>

    <!-- not downstairs at all: this is YOUR hallway, right here. Someone is standing in it. -->
    <g data-name="feed-hallway" data-hidden>
      <rect x="200" y="96" width="980" height="628" fill="var(--void)"/>
      <g transform="translate(130 95) scale(0.7)">
        <rect width="1600" height="900" fill="var(--skin)" opacity="0.14"/>
        <polygon points="0,0 1600,0 1200,160 400,160" fill="var(--void)" opacity="0.55"/>
        <polygon points="0,900 1600,900 1200,640 400,640" fill="var(--void)" opacity="0.4"/>
        <polygon points="0,0 400,160 400,640 0,900" fill="var(--void)" opacity="0.25"/>
        <polygon points="1600,0 1200,160 1200,640 1600,900" fill="var(--void)" opacity="0.25"/>
        <polygon points="240,198 350,227 350,662 240,742" fill="var(--void)"/>
        <polygon points="1450,172 1300,208 1300,705 1450,802" fill="var(--void)"/>
        <g fill="var(--skin)" opacity="0.24">
          <rect x="422" y="280" width="184" height="16"/>
          <polygon points="420,322 476,322 492,478 404,478"/>
          <polygon points="562,320 598,320 608,410 552,410"/>
          <rect x="420" y="554" width="188" height="86"/>
          <rect x="628" y="390" width="38" height="62"/>
          <rect x="684" y="226" width="232" height="414"/>
          <rect x="1038" y="540" width="152" height="100"/>
          <polygon points="1084,452 1140,452 1156,496 1068,496"/>
          <rect x="1072" y="290" width="84" height="64"/>
        </g>
        <rect x="700" y="242" width="200" height="398" fill="var(--void)" opacity="0.3"/>
        <rect x="702" y="634" width="196" height="6" fill="var(--skin)" opacity="0.6"/>
        <rect x="946" y="328" width="70" height="136" rx="8" fill="var(--skin)" opacity="0.3"/>
        <rect x="956" y="344" width="50" height="46" fill="var(--skin)" opacity="0.9"/>
        <!-- the tall thin one -->
        <g data-name="figure" data-scare>
          <ellipse cx="654" cy="782" rx="70" ry="12" fill="var(--void)" opacity="0.6"/>
          <ellipse cx="654" cy="196" rx="25" ry="36" fill="var(--skin)" opacity="0.95"/>
          <ellipse cx="644" cy="192" rx="5" ry="9" fill="var(--void)"/>
          <ellipse cx="664" cy="192" rx="5" ry="9" fill="var(--void)"/>
          <rect x="647" y="228" width="14" height="22" fill="var(--void)" opacity="0.95"/>
          <polygon points="624,246 684,246 676,530 632,530" fill="var(--void)" opacity="0.95"/>
          <polygon points="624,250 634,250 620,640 608,640" fill="var(--void)" opacity="0.95"/>
          <polygon points="674,250 684,250 700,640 688,640" fill="var(--void)" opacity="0.95"/>
          <ellipse cx="613" cy="654" rx="8" ry="18" fill="var(--skin)" opacity="0.9"/>
          <ellipse cx="695" cy="654" rx="8" ry="18" fill="var(--skin)" opacity="0.9"/>
          <polygon points="634,528 652,528 646,782 634,782" fill="var(--void)" opacity="0.95"/>
          <polygon points="656,528 674,528 674,782 662,782" fill="var(--void)" opacity="0.95"/>
        </g>
      </g>
    </g>

    <!-- camera look: scanlines, grain, a slow rolling bar, and the camera's words -->
    <rect x="200" y="96" width="980" height="628" fill="url(#doorbell-camera-lines)"/>
    <rect x="200" y="96" width="980" height="628" filter="url(#doorbell-camera-noise)" opacity="0.06"/>
    <rect x="200" y="96" width="980" height="50" fill="var(--skin)" opacity="0.05">
      <animate attributeName="y" values="40;724" dur="6s" repeatCount="indefinite"/>
    </rect>
    <polygon points="200,96 520,96 200,420" fill="var(--skin)" opacity="0.035"/>
    <g fill="var(--skin)" opacity="0.5">
      <rect x="222" y="118" width="44" height="4"/><rect x="222" y="118" width="4" height="44"/>
      <rect x="1114" y="118" width="44" height="4"/><rect x="1154" y="118" width="4" height="44"/>
      <rect x="222" y="698" width="44" height="4"/><rect x="222" y="658" width="4" height="44"/>
      <rect x="1114" y="698" width="44" height="4"/><rect x="1154" y="658" width="4" height="44"/>
    </g>
    <g font-family="monospace" font-size="24" letter-spacing="3" fill="var(--skin)" opacity="0.75">
      <text x="246" y="152">CAM 1</text><text x="1046" y="152">LIVE</text>
    </g>
    <circle cx="1030" cy="144" r="8" fill="var(--skin)" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.6s" repeatCount="indefinite"/>
    </circle>
  </g>

  <!-- the speaker, and the little light that says the screen is on -->
  <circle cx="1330" cy="140" r="6" fill="var(--skin)" opacity="0.8"/>
  <g fill="var(--void)" opacity="0.6">
    <rect x="1276" y="176" width="108" height="7" rx="3.5"/><rect x="1276" y="194" width="108" height="7" rx="3.5"/>
    <rect x="1276" y="212" width="108" height="7" rx="3.5"/><rect x="1276" y="230" width="108" height="7" rx="3.5"/>
  </g>

  <!-- TALK button -->
  <g data-name="talk">
    <circle cx="1330" cy="360" r="64" fill="var(--accent)"/>
    <circle cx="1330" cy="360" r="54" fill="var(--furniture)"/>
    <rect x="1302" y="334" width="56" height="40" rx="12" fill="var(--skin)" opacity="0.85"/>
    <polygon points="1312,370 1328,370 1308,390" fill="var(--skin)" opacity="0.85"/>
    <rect x="1314" y="348" width="32" height="4" rx="2" fill="var(--furniture)"/>
    <rect x="1314" y="358" width="22" height="4" rx="2" fill="var(--furniture)"/>
    <text x="1330" y="466" text-anchor="middle" font-size="30" letter-spacing="5" fill="var(--skin)">TALK</text>
  </g>

  <!-- OPEN button: opens the building's door downstairs -->
  <g data-name="open">
    <circle cx="1330" cy="580" r="64" fill="var(--accent)"/>
    <circle cx="1330" cy="580" r="54" fill="var(--furniture)"/>
    <circle cx="1308" cy="580" r="16" fill="var(--skin)" opacity="0.85"/>
    <circle cx="1308" cy="580" r="6" fill="var(--furniture)"/>
    <rect x="1320" y="576" width="40" height="8" fill="var(--skin)" opacity="0.85"/>
    <rect x="1344" y="584" width="6" height="10" fill="var(--skin)" opacity="0.85"/>
    <rect x="1354" y="584" width="6" height="14" fill="var(--skin)" opacity="0.85"/>
    <text x="1330" y="686" text-anchor="middle" font-size="30" letter-spacing="5" fill="var(--skin)">OPEN</text>
  </g>
</svg>`;
