// The hallway by the front door, where the night starts. Same perspective as the living room.
// The living room is through the doorway on the left, the bedrooms and bathrooms down the corridor on the right.
// Clickable things have data-hotspot="...", the same names as in story.js.
ROOMS["entrance"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="entrance-lamp-light">
      <stop offset="0" style="stop-color: var(--glow)" stop-opacity="0.5"/>
      <stop offset="1" style="stop-color: var(--glow)" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="entrance-doorbell-light">
      <stop offset="0" style="stop-color: var(--skin)" stop-opacity="0.45"/>
      <stop offset="1" style="stop-color: var(--skin)" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- the room: back wall, ceiling, floor and the two side walls -->
  <rect width="1600" height="900" fill="var(--wall)"/>
  <polygon points="0,0 1600,0 1200,160 400,160" fill="var(--void)" opacity="0.55"/>
  <polygon points="0,900 1600,900 1200,640 400,640" fill="var(--void)" opacity="0.4"/>
  <polygon points="0,0 400,160 400,640 0,900" fill="var(--void)" opacity="0.25"/>
  <polygon points="1600,0 1200,160 1200,640 1600,900" fill="var(--void)" opacity="0.25"/>
  <!-- ceiling light (it won't help after nine) and the doormat -->
  <ellipse cx="800" cy="104" rx="56" ry="13" fill="var(--furniture)"/>
  <ellipse cx="800" cy="100" rx="38" ry="6" fill="var(--accent)" opacity="0.5"/>
  <polygon points="712,654 888,654 912,696 688,696" fill="var(--accent)" opacity="0.3"/>

  <!-- doorway to the living room (left wall). Far away, its window. -->
  <polygon points="228,190 362,222 362,668 228,752" fill="var(--furniture)"/>
  <polygon points="240,198 350,227 350,662 240,742" fill="var(--void)"/>
  <rect x="284" y="316" width="40" height="86" fill="var(--accent)" opacity="0.22"/>
  <rect x="294" y="370" width="5" height="6" fill="var(--glow)" opacity="0.4"/>
  <rect x="310" y="386" width="5" height="6" fill="var(--glow)" opacity="0.3"/>

  <!-- the corridor to the bedrooms and bathrooms (right wall) -->
  <polygon points="1462,166 1288,204 1288,712 1462,812" fill="var(--furniture)"/>
  <polygon points="1450,172 1300,208 1300,705 1450,802" fill="var(--void)"/>
  <polygon points="1392,300 1428,292 1428,640 1392,620" fill="var(--furniture)" opacity="0.35"/>

  <!-- the not-sister, standing in the corridor. Too still. -->
  <g data-hotspot="not-sister" data-hidden>
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

  <!-- coat hooks: your jacket, your sister's little coat, and two empty hooks in between -->
  <g data-hotspot="coats">
    <rect x="422" y="280" width="184" height="16" rx="3" fill="var(--furniture)"/>
    <rect x="422" y="280" width="184" height="4" fill="var(--accent)" opacity="0.5"/>
    <g fill="var(--accent)">
      <rect x="445" y="294" width="6" height="18" rx="3"/>
      <rect x="489" y="294" width="6" height="22" rx="3"/>
      <rect x="489" y="310" width="14" height="6" rx="3"/>
      <rect x="533" y="294" width="6" height="22" rx="3"/>
      <rect x="533" y="310" width="14" height="6" rx="3"/>
      <rect x="577" y="294" width="6" height="18" rx="3"/>
    </g>
    <ellipse cx="448" cy="322" rx="22" ry="17" fill="var(--furniture)"/>
    <polygon points="420,326 476,326 492,478 404,478" fill="var(--furniture)"/>
    <polygon points="420,326 432,326 420,470 404,478" fill="var(--void)" opacity="0.25"/>
    <polygon points="464,326 476,326 492,478 476,470" fill="var(--void)" opacity="0.25"/>
    <rect x="446" y="336" width="4" height="140" fill="var(--accent)" opacity="0.6"/>
    <rect x="456" y="420" width="18" height="4" fill="var(--void)" opacity="0.4"/>
    <ellipse cx="580" cy="318" rx="16" ry="13" fill="var(--accent)"/>
    <rect x="546" y="328" width="16" height="66" rx="8" fill="var(--accent)" opacity="0.8"/>
    <rect x="598" y="328" width="16" height="66" rx="8" fill="var(--accent)" opacity="0.8"/>
    <rect x="556" y="324" width="48" height="84" rx="10" fill="var(--accent)"/>
    <g fill="var(--void)" opacity="0.3">
      <rect x="556" y="350" width="48" height="3"/>
      <rect x="556" y="376" width="48" height="3"/>
      <rect x="579" y="330" width="2" height="78"/>
    </g>
  </g>

  <!-- shoe rack under the coats -->
  <rect x="424" y="560" width="8" height="80" fill="var(--furniture)"/>
  <rect x="596" y="560" width="8" height="80" fill="var(--furniture)"/>
  <rect x="420" y="554" width="188" height="10" fill="var(--accent)" opacity="0.7"/>
  <rect x="424" y="600" width="180" height="6" fill="var(--furniture)"/>
  <rect x="440" y="584" width="40" height="16" rx="7" fill="var(--void)" opacity="0.5"/>
  <rect x="488" y="586" width="36" height="14" rx="7" fill="var(--accent)"/>
  <rect x="542" y="584" width="40" height="16" rx="7" fill="var(--void)" opacity="0.5"/>
  <rect x="446" y="624" width="34" height="16" rx="7" fill="var(--accent)" opacity="0.7"/>
  <rect x="552" y="606" width="14" height="34" rx="4" fill="var(--furniture)"/>
  <rect x="570" y="606" width="14" height="34" rx="4" fill="var(--furniture)"/>

  <!-- light switch -->
  <g data-hotspot="light-switch">
    <rect x="628" y="390" width="38" height="62" rx="5" fill="var(--accent)" opacity="0.75"/>
    <rect x="638" y="402" width="18" height="38" rx="3" fill="var(--furniture)"/>
    <rect x="638" y="402" width="18" height="16" rx="3" fill="var(--accent)" opacity="0.6"/>
  </g>

  <!-- the front door. The stairwell light shows in the crack under it. -->
  <g data-hotspot="front-door">
    <rect x="684" y="226" width="232" height="414" fill="var(--accent)" opacity="0.5"/>
    <rect x="700" y="242" width="200" height="398" fill="var(--furniture)"/>
    <rect x="722" y="268" width="156" height="150" rx="3" fill="var(--void)" opacity="0.25"/>
    <rect x="722" y="444" width="156" height="170" rx="3" fill="var(--void)" opacity="0.25"/>
    <rect x="784" y="282" width="32" height="12" rx="2" fill="var(--accent)" opacity="0.8"/>
    <circle cx="800" cy="330" r="7" fill="var(--accent)"/>
    <circle cx="800" cy="330" r="3" fill="var(--void)"/>
    <rect x="700" y="290" width="6" height="26" fill="var(--accent)"/>
    <rect x="700" y="566" width="6" height="26" fill="var(--accent)"/>
    <circle cx="876" cy="418" r="8" fill="var(--accent)"/>
    <rect x="874.5" y="414" width="3" height="8" fill="var(--void)"/>
    <circle cx="876" cy="456" r="9" fill="var(--accent)"/>
    <rect x="846" y="451" width="34" height="10" rx="5" fill="var(--accent)"/>
    <rect x="702" y="635" width="196" height="5" fill="var(--glow)" opacity="0.35"/>
    <polygon points="702,640 898,640 912,654 688,654" fill="var(--glow)" opacity="0.07"/>
    <!-- while "Mom" rings downstairs, two shadows stand outside this door -->
    <g data-name="feet" data-hidden fill="var(--void)" opacity="0.9">
      <rect x="758" y="635" width="30" height="5"/>
      <rect x="812" y="635" width="30" height="5"/>
      <polygon points="758,640 788,640 792,654 752,654"/>
      <polygon points="812,640 842,640 848,654 808,654"/>
    </g>
  </g>

  <!-- the note that slides under the door (rule 7) -->
  <g data-hotspot="fake-note" data-hidden>
    <polygon points="742,644 852,638 868,674 736,682" fill="var(--glow)" opacity="0.6"/>
    <polygon points="760,652 836,648 837,652 761,656" fill="var(--void)" opacity="0.5"/>
    <polygon points="758,662 846,657 847,661 759,666" fill="var(--void)" opacity="0.5"/>
    <polygon points="756,671 818,668 819,672 757,675" fill="var(--void)" opacity="0.5"/>
  </g>

  <!-- the doorbell: a little screen that shows the camera downstairs -->
  <g data-hotspot="doorbell">
    <rect x="946" y="328" width="70" height="136" rx="8" fill="var(--furniture)"/>
    <rect x="950" y="330" width="62" height="4" rx="2" fill="var(--accent)" opacity="0.6"/>
    <rect x="956" y="344" width="50" height="46" rx="3" fill="var(--void)"/>
    <circle cx="981" cy="414" r="10" fill="var(--accent)"/>
    <rect x="964" y="436" width="34" height="3" rx="1.5" fill="var(--void)" opacity="0.6"/>
    <rect x="964" y="443" width="34" height="3" rx="1.5" fill="var(--void)" opacity="0.6"/>
    <rect x="964" y="450" width="34" height="3" rx="1.5" fill="var(--void)" opacity="0.6"/>
    <!-- ...and when it rings, the screen lights up the wall -->
    <g data-name="doorbell-glow" data-hidden>
      <circle cx="981" cy="367" r="140" fill="url(#entrance-doorbell-light)" pointer-events="none"/>
      <rect x="956" y="344" width="50" height="46" rx="3" fill="var(--skin)" opacity="0.8"/>
      <rect x="956" y="356" width="50" height="2" fill="var(--void)" opacity="0.3"/>
      <rect x="956" y="370" width="50" height="2" fill="var(--void)" opacity="0.3"/>
      <circle cx="981" cy="414" r="5" fill="var(--glow)"/>
    </g>
  </g>

  <!-- family photo -->
  <rect x="1072" y="290" width="84" height="64" fill="var(--furniture)"/>
  <rect x="1080" y="298" width="68" height="48" fill="var(--accent)" opacity="0.45"/>
  <g fill="var(--void)" opacity="0.5">
    <circle cx="1094" cy="316" r="6"/><circle cx="1110" cy="314" r="6"/>
    <circle cx="1124" cy="324" r="5"/><circle cx="1136" cy="328" r="4"/>
    <rect x="1086" y="324" width="58" height="22"/>
  </g>

  <!-- lamp on the shoe cabinet, and its light while the lights still work -->
  <g data-name="lamp-glow" data-light-only pointer-events="none">
    <circle cx="1112" cy="468" r="190" fill="url(#entrance-lamp-light)"/>
    <ellipse cx="1112" cy="664" rx="140" ry="26" fill="var(--glow)" opacity="0.1"/>
  </g>
  <rect x="1044" y="548" width="140" height="92" fill="var(--furniture)"/>
  <rect x="1038" y="540" width="152" height="10" fill="var(--accent)"/>
  <rect x="1052" y="560" width="60" height="72" fill="var(--void)" opacity="0.25"/>
  <rect x="1116" y="560" width="60" height="72" fill="var(--void)" opacity="0.25"/>
  <rect x="1102" y="584" width="5" height="18" rx="2" fill="var(--accent)"/>
  <rect x="1121" y="584" width="5" height="18" rx="2" fill="var(--accent)"/>
  <ellipse cx="1112" cy="538" rx="18" ry="5" fill="var(--furniture)"/>
  <rect x="1109" y="492" width="6" height="46" fill="var(--furniture)"/>
  <polygon points="1084,452 1140,452 1156,496 1068,496" fill="var(--accent)"/>
  <!-- the key bowl: empty. Mom and Dad took their keys. -->
  <ellipse cx="1160" cy="536" rx="17" ry="6" fill="var(--accent)" opacity="0.8"/>
  <ellipse cx="1160" cy="534" rx="11" ry="3" fill="var(--void)" opacity="0.5"/>
</svg>`;
