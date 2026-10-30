// The walk-in closet in Mom and Dad's bedroom. There's no light in here: only a thin line
// of light under the door. Rule 1 says: hide in here and wait until it stops calling your name.
// Clickable things have data-hotspot="...", the same names as in story.js.
ROOMS["walk-in"] = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- one of each piece of clothing, hanging from the rail at 0,0. They're drawn again and again below, smaller further away. -->
    <g id="walk-in-dress">
      <polygon points="-22,12 22,12 28,50 54,218 -54,218 -28,50"/>
      <polygon points="8,12 22,12 28,50 54,218 22,218" fill="var(--void)" opacity="0.3"/>
      <rect x="-29" y="48" width="58" height="5" fill="var(--void)" opacity="0.3"/>
      <polygon points="-40,14 0,0 40,14 36,17 0,5 -36,17" fill="var(--accent)"/>
    </g>
    <g id="walk-in-shirt">
      <polygon points="-38,12 -50,24 -52,128 -42,128 -40,150 40,150 42,128 52,128 50,24 38,12"/>
      <polygon points="18,12 38,12 50,24 52,128 42,128 40,150 18,150" fill="var(--void)" opacity="0.25"/>
      <polygon points="-12,12 12,12 0,28" fill="var(--void)" opacity="0.45"/>
      <rect x="-1" y="28" width="2" height="122" fill="var(--void)" opacity="0.3"/>
      <polygon points="-40,14 0,0 40,14 36,17 0,5 -36,17" fill="var(--accent)"/>
    </g>
    <g id="walk-in-coat">
      <polygon points="-44,12 44,12 48,196 -48,196"/>
      <polygon points="20,12 44,12 48,196 20,196" fill="var(--void)" opacity="0.3"/>
      <polygon points="-16,12 16,12 4,72 -4,72" fill="var(--void)" opacity="0.4"/>
      <rect x="-46" y="104" width="92" height="7" fill="var(--void)" opacity="0.3"/>
      <polygon points="-40,14 0,0 40,14 36,17 0,5 -36,17" fill="var(--accent)"/>
    </g>
    <g id="walk-in-shoes" fill="var(--furniture)">
      <path d="M10,-4 L10,-16 Q14,-22 24,-20 L40,-14 Q54,-12 56,-4 Z" opacity="0.7"/>
      <path d="M0,0 L0,-12 Q4,-18 14,-16 L30,-10 Q44,-8 46,0 Z"/>
    </g>
  </defs>

  <!-- the room: back wall, ceiling, floor and the two side walls. Then: it's dark in here. -->
  <rect width="1600" height="900" fill="var(--wall)"/>
  <polygon points="0,0 1600,0 1200,160 400,160" fill="var(--void)" opacity="0.55"/>
  <polygon points="0,900 1600,900 1200,640 400,640" fill="var(--void)" opacity="0.4"/>
  <polygon points="0,0 400,160 400,640 0,900" fill="var(--void)" opacity="0.25"/>
  <polygon points="1600,0 1200,160 1200,640 1600,900" fill="var(--void)" opacity="0.25"/>
  <rect width="1600" height="900" fill="var(--void)" opacity="0.6"/>
  <!-- a bare bulb with a pull chain. It doesn't work. -->
  <rect x="798" y="56" width="4" height="44" fill="var(--furniture)"/>
  <circle cx="800" cy="112" r="14" fill="var(--furniture)"/>
  <circle cx="795" cy="107" r="5" fill="var(--accent)" opacity="0.4"/>
  <rect x="805" y="120" width="2" height="62" fill="var(--accent)" opacity="0.5"/>
  <circle cx="806" cy="184" r="3" fill="var(--accent)" opacity="0.6"/>

  <!-- the closet door, back to the bedroom. Light comes in through the keyhole too. -->
  <g opacity="0.8">
    <rect x="688" y="226" width="224" height="414" fill="var(--accent)" opacity="0.25"/>
    <rect x="704" y="242" width="192" height="392" fill="var(--furniture)"/>
    <rect x="724" y="264" width="152" height="150" rx="3" fill="var(--void)" opacity="0.3"/>
    <rect x="724" y="438" width="152" height="176" rx="3" fill="var(--void)" opacity="0.3"/>
    <circle cx="876" cy="428" r="9" fill="var(--accent)"/>
  </g>
  <rect x="874.5" y="444" width="3" height="8" fill="var(--glow)" opacity="0.7"/>

  <!-- scratched into the door, low down, where a kid would sit. Only your flashlight finds it. -->
  <g data-name="scratches" data-dark-only fill="var(--accent)" opacity="0.8">
    <polygon points="734,498 732.3,522 735,546 736.7,522"/>
    <polygon points="733,499 739.9,503.1 748,503 741.1,498.9"/>
    <polygon points="748,503 750.6,512.5 757,520 754.4,510.5"/>
    <polygon points="757,520 751.4,529.3 750,540 755.6,530.7"/>
    <polygon points="750,540 741.3,540.4 734,545 742.7,544.6"/>
    <polygon points="779,498 782.9,505.5 790,510 786.1,502.5"/>
    <polygon points="790,510 788.3,521.6 791,533 792.7,521.4"/>
    <polygon points="791,533 783.4,538 779,546 786.6,541"/>
    <polygon points="779,546 775.1,538.5 768,534 771.9,541.5"/>
    <polygon points="768,534 769.7,522.4 767,511 765.3,522.6"/>
    <polygon points="767,511 774.1,506.5 778,499 770.9,503.5"/>
    <polygon points="802,546 804.7,522 803,498 800.3,522"/>
    <polygon points="803,499 811,522.9 823,545 815,521.1"/>
    <polygon points="823,546 825.7,522 824,498 821.3,522"/>
    <polygon points="841,498 837.3,504.5 838,512 841.7,505.5"/>
    <polygon points="848,500 861.2,501.2 874,498 860.8,496.8"/>
    <polygon points="861,499 859.3,522.5 862,546 863.7,522.5"/>
  </g>

  <!-- the thin line of light under the door -->
  <g data-hotspot="door-light">
    <rect x="688" y="590" width="224" height="100" fill="var(--void)" opacity="0"/>
    <g fill="var(--glow)">
      <polygon points="704,640 896,640 1010,740 590,740" opacity="0.025"/>
      <polygon points="704,640 896,640 962,700 638,700" opacity="0.03"/>
      <polygon points="704,640 896,640 928,666 672,666" opacity="0.04"/>
    </g>
    <rect x="704" y="634" width="192" height="6" fill="var(--glow)" opacity="0.7"/>
  </g>
  <!-- something is standing right outside the door (rule 1) -->
  <g data-name="shadow" data-hidden fill="var(--void)">
    <rect x="756" y="634" width="32" height="6"/>
    <rect x="812" y="634" width="32" height="6"/>
    <polygon points="756,640 788,640 774,740 694,740" opacity="0.7"/>
    <polygon points="812,640 844,640 906,740 826,740" opacity="0.7"/>
  </g>

  <!-- the clothes rails along both walls -->
  <polygon points="455,263 455,268 113,204 113,196" fill="var(--accent)" opacity="0.6"/>
  <polygon points="1145,263 1145,268 1487,204 1487,196" fill="var(--accent)" opacity="0.6"/>
  <!-- Mom's dresses and Dad's shirts (left wall) -->
  <g data-hotspot="clothes" opacity="0.75">
    <use href="#walk-in-dress" transform="translate(442.9 263.3) scale(1 1)" fill="var(--accent)"/>
    <use href="#walk-in-shirt" transform="translate(418.8 258.6) scale(1.1 1.1)" fill="var(--furniture)"/>
    <use href="#walk-in-coat" transform="translate(394.7 254) scale(1.1 1.1)" fill="var(--furniture)"/>
    <use href="#walk-in-dress" transform="translate(366.5 248.6) scale(1.2 1.2)" fill="var(--accent)"/>
    <use href="#walk-in-shirt" transform="translate(338.4 243.2) scale(1.3 1.3)" fill="var(--accent)"/>
    <use href="#walk-in-coat" transform="translate(310.2 237.8) scale(1.4 1.4)" fill="var(--furniture)"/>
    <use href="#walk-in-dress" transform="translate(282.1 232.4) scale(1.4 1.4)" fill="var(--accent)"/>
    <use href="#walk-in-shirt" transform="translate(253.9 227) scale(1.5 1.5)" fill="var(--furniture)"/>
  </g>
  <!-- more of Dad's shirts and coats (right wall) -->
  <g opacity="0.75">
    <use href="#walk-in-shirt" transform="translate(1157.1 263.3) scale(-1 1)" fill="var(--furniture)"/>
    <use href="#walk-in-coat" transform="translate(1181.2 258.6) scale(-1.1 1.1)" fill="var(--furniture)"/>
    <use href="#walk-in-shirt" transform="translate(1205.3 254) scale(-1.1 1.1)" fill="var(--accent)"/>
    <use href="#walk-in-shirt" transform="translate(1233.5 248.6) scale(-1.2 1.2)" fill="var(--furniture)"/>
    <use href="#walk-in-coat" transform="translate(1261.6 243.2) scale(-1.3 1.3)" fill="var(--furniture)"/>
    <use href="#walk-in-shirt" transform="translate(1289.8 237.8) scale(-1.4 1.4)" fill="var(--accent)"/>
    <use href="#walk-in-shirt" transform="translate(1317.9 232.4) scale(-1.4 1.4)" fill="var(--furniture)"/>
    <use href="#walk-in-coat" transform="translate(1346.1 227) scale(-1.5 1.5)" fill="var(--furniture)"/>
  </g>
  <!-- shoes on the floor -->
  <g opacity="0.8">
    <use href="#walk-in-shoes" transform="translate(369.9 659.5) scale(1.1 1.1)"/>
    <use href="#walk-in-shoes" transform="translate(293.2 709.3) scale(1.2 1.2)"/>
    <use href="#walk-in-shoes" transform="translate(216.5 759.1) scale(1.4 1.4)"/>
    <use href="#walk-in-shoes" transform="translate(1230.1 659.5) scale(-1.1 1.1)"/>
    <use href="#walk-in-shoes" transform="translate(1306.8 709.3) scale(-1.2 1.2)"/>
    <use href="#walk-in-shoes" transform="translate(1383.5 759.1) scale(-1.4 1.4)"/>
  </g>
</svg>`;
