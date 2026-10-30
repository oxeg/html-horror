// Builder-only, migration-only: the box of every clickable drawing part before the restructure,
// in viewBox units (1600x900). Made by tests/tools/measure.html. Task 14 deletes it.
var HOTSPOT_BOXES = {
  "entrance": {
    "not-sister": [1326, 436, 96, 314],
    "coats": [404, 280, 210, 198],
    "light-switch": [628, 390, 38, 62],
    "front-door": [684, 226, 232, 428],
    "fake-note": [736, 638, 132, 44],
    "doorbell": [946, 328, 70, 136],
  },
  "living": {
    "not-sister": [178, 436, 96, 314],
    "counter": [545, 457, 225, 183],
    "fridge": [420, 228, 122, 412],
    "fridge-note": [445.8, 383.6, 60.7, 76.2],
    "cat-bowl": [598, 695, 84, 26],
    "window": [818, 198, 244, 244],
    "sofa": [788, 500, 314, 148],
    "balcony-door": [1220, 150, 220, 647],
    "cat-outside": [1261.5, 566, 72.6, 118],
    "reflection": [1318, 418, 98.1, 300],
  },
  "my-room": {
    "not-sister": [178, 436, 96, 314],
    "posters": [429.7, 197.5, 219.9, 247.5],
    "desk": [420, 452, 272, 208],
    "window": [690, 198, 260, 252],
    "bed": [972, 466, 410, 280],
  },
  "sister-room": {
    "window": [440, 198, 264, 252],
    "night-light": [716, 480, 76, 82],
    "sister-asleep": [846, 520, 294, 92],
    "sister-awake": [540, 543, 168, 207],
    "toys": [1180, 553, 220.7, 191],
  },
  "master-door": {
    "not-sister": [1326, 436, 96, 314],
    "door-closed": [684, 226, 232, 414],
    "door-open": [670, 226, 260, 442],
  },
  "master": {
    "window": [678, 190, 244, 244],
    "bed": [500, 452, 600, 305],
    "tree-house": [214, 414, 238, 336],
    "walk-in-door": [1250, 170, 150, 600],
  },
  "walk-in": {
    "door-light": [590, 590, 420, 150],
    "clothes": [175.9, 227, 321, 310.6],
  },
  "bath-washer": {
    "lock": [252, 336, 96, 108],
    "mirror": [466, 232, 188, 206],
    "sink": [442, 440.1, 236, 199.9],
    "washer": [785, 440, 190, 202],
    "shower": [1222, 127, 186, 639],
  },
  "bath": {
    "lock": [252, 336, 96, 108],
    "mirror": [466, 232, 188, 206],
    "sink": [442, 440.1, 236, 199.9],
    "basket": [734.1, 457.3, 261.5, 218.7],
    "shower": [1222, 127, 186, 639],
  },
  "doorbell-camera": {
    "talk": [1266, 296, 128, 177.5],
    "open": [1266, 516, 128, 177.5],
  },
};

