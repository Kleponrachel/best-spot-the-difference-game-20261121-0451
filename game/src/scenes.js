// Six original picture scenes, drawn in code in a 480x360 space — no image files, no copies of
// anyone else's art. Every scene is drawn twice: `variant` 0 is the left picture, 1 is the
// right picture, and the right one applies exactly seven small changes. A difference is a spot
// in that 480x360 space with a click radius and a short name, so the world can test clicks, ring
// hints and list what was found.
function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

/** A little pine tree: three stacked triangles and a trunk. */
function pine(ctx, x, y, s, color) {
  poly(ctx, [[x - 26 * s, y], [x, y - 34 * s], [x + 26 * s, y]], color);
  poly(ctx, [[x - 22 * s, y - 24 * s], [x, y - 54 * s], [x + 22 * s, y - 24 * s]], color);
  poly(ctx, [[x - 17 * s, y - 44 * s], [x, y - 70 * s], [x + 17 * s, y - 44 * s]], color);
  rect(ctx, x - 4 * s, y, 8 * s, 12 * s, '#6b4226');
}

/** A five-pointed star, for the night sky. */
function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------------------
// 1. Harbour Dawn — lighthouse, sailboat, buoys, gulls, crates on the pier.
// ---------------------------------------------------------------------------
function drawHarbour(ctx, variant) {
  rect(ctx, 0, 0, 480, 215, '#aee2f5');
  rect(ctx, 0, 215, 480, 145, '#2f7fb8');
  ellipse(ctx, 120, 218, 130, 26, '#3f7d5a');
  ellipse(ctx, 350, 220, 150, 30, '#356b4c');
  // Sun with rays (right picture: the rays are gone).
  circle(ctx, 410, 55, 26, '#ffd93b');
  if (variant === 0) {
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      line(ctx, 410 + Math.cos(a) * 32, 55 + Math.sin(a) * 32, 410 + Math.cos(a) * 44, 55 + Math.sin(a) * 44, '#ffd93b', 4);
    }
  }
  // Clouds.
  ellipse(ctx, 90, 50, 34, 14, '#ffffff');
  ellipse(ctx, 210, 36, 28, 12, '#ffffff');
  ellipse(ctx, 330, 72, 30, 12, '#ffffff');
  // Gulls (right picture: the middle gull is gone).
  line(ctx, 145, 82, 152, 76, '#334155', 2);
  line(ctx, 152, 76, 159, 82, '#334155', 2);
  if (variant === 0) {
    line(ctx, 185, 67, 192, 61, '#334155', 2);
    line(ctx, 192, 61, 199, 67, '#334155', 2);
  }
  line(ctx, 235, 92, 242, 86, '#334155', 2);
  line(ctx, 242, 86, 249, 92, '#334155', 2);
  // Lighthouse.
  rect(ctx, 52, 92, 40, 123, '#f8fafc');
  rect(ctx, 52, 118, 40, 16, '#e05252');
  rect(ctx, 52, 164, 40, 16, '#e05252');
  rect(ctx, 46, 78, 52, 16, '#334155');
  rect(ctx, 58, 62, 28, 18, '#fde68a');
  poly(ctx, [[54, 62], [72, 46], [90, 62]], '#e05252');
  line(ctx, 72, 46, 72, 28, '#334155', 3);
  poly(ctx, [[72, 28], [96, 34], [72, 42]], variant === 0 ? '#e05252' : '#3b82f6');
  if (variant === 0) rect(ctx, 66, 146, 12, 16, '#1e293b'); // lit window
  // Sailboat (right picture: the sail is yellow, not white).
  poly(ctx, [[160, 292], [212, 292], [202, 272], [172, 272]], '#c2410c');
  line(ctx, 186, 272, 186, 218, '#7c2d12', 3);
  poly(ctx, [[188, 220], [188, 268], [224, 268]], variant === 0 ? '#ffffff' : '#facc15');
  poly(ctx, [[184, 228], [184, 268], [158, 268]], '#f1f5f9');
  // Rowboat.
  poly(ctx, [[296, 300], [336, 300], [328, 288], [304, 288]], '#92400e');
  line(ctx, 316, 288, 330, 272, '#78350f', 3);
  // Pier with crates (right picture: one crate is gone).
  rect(ctx, 330, 306, 150, 14, '#8a5a2b');
  rect(ctx, 340, 320, 8, 26, '#6b4226');
  rect(ctx, 452, 320, 8, 26, '#6b4226');
  rect(ctx, 348, 282, 24, 24, '#b45309');
  line(ctx, 348, 294, 372, 294, '#92400e', 2);
  if (variant === 0) {
    rect(ctx, 376, 286, 20, 20, '#b45309');
    line(ctx, 376, 296, 396, 296, '#92400e', 2);
  }
  // Buoys (right picture: one extra buoy).
  circle(ctx, 140, 302, 9, '#f97316');
  rect(ctx, 131, 300, 18, 4, '#ffffff');
  circle(ctx, 230, 322, 9, '#f97316');
  rect(ctx, 221, 320, 18, 4, '#ffffff');
  circle(ctx, 392, 302, 9, '#f97316');
  rect(ctx, 383, 300, 18, 4, '#ffffff');
  if (variant === 1) {
    circle(ctx, 320, 312, 9, '#f97316');
    rect(ctx, 311, 310, 18, 4, '#ffffff');
  }
}

// ---------------------------------------------------------------------------
// 2. Forest Camp — tent, campfire, owl, backpack and pines under the stars.
// ---------------------------------------------------------------------------
function drawCamp(ctx, variant) {
  rect(ctx, 0, 0, 480, 360, '#101c3a');
  rect(ctx, 0, 262, 480, 98, '#1d3a24');
  // Stars (right picture: one star is gone) and moon.
  const stars = [[40, 40], [120, 28], [200, 52], [300, 40], [360, 26], [440, 70], [80, 110], [260, 90]];
  stars.forEach(([x, y], i) => {
    if (variant === 1 && i === 3) return;
    star(ctx, x, y, 5, '#fef9c3');
  });
  circle(ctx, 400, 62, 24, '#f5f0c8');
  circle(ctx, 392, 56, 5, '#d9cf9a');
  circle(ctx, 408, 70, 4, '#d9cf9a');
  // Pines (right picture: one extra small pine).
  pine(ctx, 60, 250, 1.15, '#14532d');
  pine(ctx, 150, 252, 0.85, '#166534');
  pine(ctx, 424, 250, 1.1, '#14532d');
  if (variant === 1) pine(ctx, 258, 254, 0.55, '#166534');
  // Owl on a branch (right picture: the owl flew away).
  line(ctx, 368, 168, 430, 158, '#4a2c14', 5);
  if (variant === 0) {
    ellipse(ctx, 398, 146, 14, 18, '#8b5a2b');
    circle(ctx, 392, 140, 4, '#ffffff');
    circle(ctx, 404, 140, 4, '#ffffff');
    circle(ctx, 392, 140, 2, '#111827');
    circle(ctx, 404, 140, 2, '#111827');
    poly(ctx, [[398, 146], [394, 152], [402, 152]], '#f59e0b');
  }
  // Tent (right picture: the door is closed).
  poly(ctx, [[150, 262], [215, 178], [280, 262]], '#ea580c');
  if (variant === 0) poly(ctx, [[202, 262], [215, 224], [228, 262]], '#431407');
  else poly(ctx, [[202, 262], [215, 224], [228, 262]], '#c2410c');
  line(ctx, 215, 178, 215, 164, '#7c2d12', 3);
  poly(ctx, [[215, 164], [231, 168], [215, 174]], '#facc15');
  // Campfire (right picture: one log is gone).
  ellipse(ctx, 318, 296, 34, 8, '#57534e');
  line(ctx, 296, 288, 340, 300, '#7c2d12', 7);
  if (variant === 0) line(ctx, 340, 288, 296, 300, '#7c2d12', 7);
  poly(ctx, [[318, 288], [306, 262], [330, 262]], '#f97316');
  poly(ctx, [[318, 282], [310, 262], [326, 262]], '#facc15');
  // Marshmallow on a stick (right picture: the marshmallow is gone).
  line(ctx, 344, 292, 372, 258, '#a16207', 3);
  if (variant === 0) circle(ctx, 374, 254, 7, '#fff7ed');
  // Backpack (right picture: green, not red).
  rect(ctx, 104, 288, 34, 30, variant === 0 ? '#dc2626' : '#16a34a');
  rect(ctx, 112, 298, 18, 12, '#7f1d1d');
  rect(ctx, 104, 282, 34, 8, variant === 0 ? '#b91c1c' : '#15803d');
  // Bushes.
  ellipse(ctx, 40, 330, 46, 26, '#14532d');
  ellipse(ctx, 450, 336, 50, 24, '#14532d');
  ellipse(ctx, 210, 340, 40, 20, '#166534');
}

// ---------------------------------------------------------------------------
// 3. Kitchen Morning — window, clock, teapot, fruit bowl, cat and plant.
// ---------------------------------------------------------------------------
function drawKitchen(ctx, variant) {
  rect(ctx, 0, 0, 480, 290, '#f6e7c8');
  rect(ctx, 0, 290, 480, 70, '#d9a066');
  // Window (right picture: the sun is gone) with red curtains.
  rect(ctx, 28, 28, 144, 122, '#ffffff');
  rect(ctx, 36, 36, 128, 106, '#93c5fd');
  if (variant === 0) circle(ctx, 72, 70, 16, '#facc15');
  ellipse(ctx, 130, 60, 22, 9, '#ffffff');
  line(ctx, 100, 36, 100, 142, '#ffffff', 4);
  line(ctx, 36, 89, 164, 89, '#ffffff', 4);
  poly(ctx, [[28, 28], [52, 28], [40, 150], [28, 150]], '#dc2626');
  poly(ctx, [[172, 28], [148, 28], [160, 150], [172, 150]], '#dc2626');
  // Wall clock (right picture: the hands read 2:30, not 10:10).
  circle(ctx, 400, 70, 26, '#ffffff');
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(400, 70, 26, 0, Math.PI * 2);
  ctx.stroke();
  if (variant === 0) {
    line(ctx, 400, 70, 386, 56, '#1e293b', 3);
    line(ctx, 400, 70, 414, 58, '#1e293b', 3);
  } else {
    line(ctx, 400, 70, 414, 56, '#1e293b', 3);
    line(ctx, 400, 70, 400, 86, '#1e293b', 3);
  }
  circle(ctx, 400, 70, 3, '#1e293b');
  // Hanging plant (right picture: the pot is blue, not terracotta).
  line(ctx, 240, 0, 240, 14, '#78350f', 3);
  poly(ctx, [[226, 14], [254, 14], [248, 34], [232, 34]], variant === 0 ? '#c2410c' : '#2563eb');
  ellipse(ctx, 228, 40, 8, 16, '#16a34a');
  ellipse(ctx, 244, 44, 8, 18, '#15803d');
  ellipse(ctx, 238, 52, 7, 14, '#22c55e');
  // Rug (right picture: two stripes, not three).
  rect(ctx, 150, 322, 180, 26, '#b91c1c');
  rect(ctx, 180, 322, 14, 26, '#fef3c7');
  rect(ctx, 240, 322, 14, 26, '#fef3c7');
  if (variant === 0) rect(ctx, 300, 322, 14, 26, '#fef3c7');
  // Table.
  rect(ctx, 56, 228, 368, 18, '#92400e');
  rect(ctx, 72, 246, 12, 44, '#78350f');
  rect(ctx, 396, 246, 12, 44, '#78350f');
  // Teapot (right picture: the handle is gone).
  ellipse(ctx, 140, 206, 34, 24, '#3b6ea5');
  rect(ctx, 128, 176, 24, 10, '#2f5a86');
  circle(ctx, 140, 174, 5, '#facc15');
  poly(ctx, [[172, 196], [192, 186], [192, 202], [172, 210]], '#3b6ea5');
  if (variant === 0) {
    ctx.strokeStyle = '#2f5a86';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(106, 202, 12, Math.PI / 2, Math.PI * 1.5, true);
    ctx.stroke();
  }
  // Cups (right picture: a third cup appears).
  rect(ctx, 224, 202, 26, 22, '#ffffff');
  rect(ctx, 224, 210, 26, 4, '#3b82f6');
  rect(ctx, 262, 202, 26, 22, '#ffffff');
  rect(ctx, 262, 210, 26, 4, '#ef4444');
  if (variant === 1) {
    rect(ctx, 300, 202, 26, 22, '#ffffff');
    rect(ctx, 300, 210, 26, 4, '#22c55e');
  }
  // Fruit bowl (right picture: one apple is gone).
  ellipse(ctx, 362, 216, 34, 12, '#7c2d12');
  circle(ctx, 348, 202, 10, '#dc2626');
  if (variant === 0) circle(ctx, 366, 198, 10, '#dc2626');
  circle(ctx, 380, 204, 10, '#dc2626');
  ellipse(ctx, 344, 208, 14, 5, '#facc15');
  // Cat on the floor (right picture: its tail is gone).
  ellipse(ctx, 428, 316, 26, 16, '#f97316');
  circle(ctx, 446, 296, 12, '#f97316');
  poly(ctx, [[438, 288], [442, 278], [446, 288]], '#f97316');
  poly(ctx, [[450, 288], [454, 278], [456, 288]], '#f97316');
  if (variant === 0) {
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(404, 312);
    ctx.quadraticCurveTo(388, 300, 392, 282);
    ctx.stroke();
  }
  circle(ctx, 450, 294, 2, '#111827');
}

// ---------------------------------------------------------------------------
// 4. Space Station — ringed planet, rocket, astronaut, satellite and stars.
// ---------------------------------------------------------------------------
function drawSpace(ctx, variant) {
  rect(ctx, 0, 0, 480, 360, '#0b1026');
  const stars = [[30, 30], [90, 70], [180, 26], [250, 50], [330, 30], [420, 110], [460, 200], [40, 180], [90, 300], [440, 300]];
  stars.forEach(([x, y], i) => {
    if (variant === 1 && i === 3) return;
    star(ctx, x, y, 4, '#e2e8f0');
  });
  // Ringed planet (right picture: the ring is gone).
  circle(ctx, 118, 118, 66, '#c96f4a');
  circle(ctx, 96, 100, 12, '#a85a38');
  circle(ctx, 140, 140, 9, '#a85a38');
  if (variant === 0) {
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(118, 118, 92, 22, -0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Moon (right picture: the craters are gone).
  circle(ctx, 402, 58, 22, '#cbd5e1');
  if (variant === 0) {
    circle(ctx, 394, 52, 4, '#94a3b8');
    circle(ctx, 410, 64, 3, '#94a3b8');
  }
  // Rocket (right picture: the window is gone).
  poly(ctx, [[296, 150], [316, 150], [312, 210], [300, 210]], '#e2e8f0');
  poly(ctx, [[296, 150], [306, 126], [316, 150]], '#ef4444');
  poly(ctx, [[296, 196], [284, 216], [296, 208]], '#ef4444');
  poly(ctx, [[316, 196], [328, 216], [316, 208]], '#ef4444');
  if (variant === 0) circle(ctx, 306, 168, 8, '#38bdf8');
  poly(ctx, [[300, 212], [312, 212], [306, 236]], '#f97316');
  // Astronaut (right picture: the tether is gone) with a visor that changes colour.
  if (variant === 0) line(ctx, 206, 252, 128, 190, '#94a3b8', 2);
  ellipse(ctx, 210, 268, 18, 24, '#f1f5f9');
  circle(ctx, 210, 238, 14, '#f1f5f9');
  circle(ctx, 210, 238, 9, variant === 0 ? '#38bdf8' : '#facc15');
  rect(ctx, 196, 262, 10, 8, '#64748b');
  rect(ctx, 214, 262, 10, 8, '#64748b');
  // Satellite (right picture: one solar panel is gone).
  rect(ctx, 368, 252, 34, 22, '#94a3b8');
  circle(ctx, 385, 263, 6, '#ef4444');
  rect(ctx, 330, 256, 34, 14, '#2563eb');
  if (variant === 0) rect(ctx, 406, 256, 34, 14, '#2563eb');
  line(ctx, 385, 240, 385, 228, '#94a3b8', 2);
  circle(ctx, 385, 226, 3, '#facc15');
  // A drifting asteroid.
  ellipse(ctx, 60, 306, 20, 13, '#78716c');
  circle(ctx, 56, 302, 3, '#57534e');
}

// ---------------------------------------------------------------------------
// 5. Garden Party — picnic blanket, cake, balloons, bees and a sunny tree.
// ---------------------------------------------------------------------------
function drawGarden(ctx, variant) {
  rect(ctx, 0, 0, 480, 360, '#bfe8ff');
  rect(ctx, 0, 262, 480, 98, '#65a30d');
  // Sun (right picture: no sunglasses).
  circle(ctx, 60, 55, 26, '#facc15');
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    line(ctx, 60 + Math.cos(a) * 32, 55 + Math.sin(a) * 32, 60 + Math.cos(a) * 43, 55 + Math.sin(a) * 43, '#facc15', 4);
  }
  if (variant === 0) {
    rect(ctx, 40, 48, 40, 9, '#111827');
    line(ctx, 40, 52, 34, 56, '#111827', 3);
    line(ctx, 80, 52, 86, 56, '#111827', 3);
  }
  ellipse(ctx, 200, 50, 32, 12, '#ffffff');
  ellipse(ctx, 330, 70, 28, 11, '#ffffff');
  // Tree with apples (right picture: one apple is gone).
  rect(ctx, 396, 180, 16, 84, '#78350f');
  ellipse(ctx, 404, 140, 62, 52, '#16a34a');
  ellipse(ctx, 366, 160, 36, 30, '#22c55e');
  ellipse(ctx, 442, 160, 36, 30, '#15803d');
  circle(ctx, 380, 150, 7, '#dc2626');
  if (variant === 0) circle(ctx, 420, 168, 7, '#dc2626');
  circle(ctx, 438, 138, 7, '#dc2626');
  // Fence.
  for (let x = 8; x < 480; x += 26) {
    rect(ctx, x, 246, 12, 40, '#f8fafc');
    poly(ctx, [[x, 246], [x + 6, 236], [x + 12, 246]], '#f8fafc');
  }
  rect(ctx, 0, 258, 480, 5, '#e2e8f0');
  // Balloons (right picture: the yellow balloon is gone).
  ellipse(ctx, 150, 92, 18, 22, '#ef4444');
  line(ctx, 150, 114, 150, 170, '#475569', 1);
  ellipse(ctx, 192, 72, 18, 22, '#3b82f6');
  line(ctx, 192, 94, 192, 170, '#475569', 1);
  if (variant === 0) {
    ellipse(ctx, 232, 96, 18, 22, '#facc15');
    line(ctx, 232, 118, 232, 170, '#475569', 1);
  }
  // Bees (right picture: one bee is gone).
  ellipse(ctx, 282, 122, 9, 6, '#facc15');
  line(ctx, 280, 116, 280, 128, '#111827', 2);
  ellipse(ctx, 282, 114, 6, 4, '#ffffff');
  if (variant === 0) {
    ellipse(ctx, 322, 142, 9, 6, '#facc15');
    line(ctx, 320, 136, 320, 148, '#111827', 2);
    ellipse(ctx, 322, 134, 6, 4, '#ffffff');
  }
  // Picnic blanket, cake and basket.
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 6; c += 1) {
      rect(ctx, 110 + c * 30, 280 + r * 18, 30, 18, (r + c) % 2 === 0 ? '#ef4444' : '#fef2f2');
    }
  }
  rect(ctx, 196, 262, 44, 18, '#f472b6');
  rect(ctx, 200, 252, 36, 10, '#f9a8d4');
  if (variant === 0) {
    line(ctx, 208, 252, 208, 238, '#facc15', 3);
    line(ctx, 218, 252, 218, 238, '#facc15', 3);
    line(ctx, 228, 252, 228, 238, '#facc15', 3);
  } else {
    line(ctx, 208, 252, 208, 238, '#facc15', 3);
    line(ctx, 228, 252, 228, 238, '#facc15', 3);
  }
  circle(ctx, 208, 236, 3, '#f97316');
  circle(ctx, 228, 236, 3, '#f97316');
  // Basket (right picture: the handle is gone).
  rect(ctx, 292, 292, 34, 20, '#b45309');
  line(ctx, 296, 300, 322, 300, '#92400e', 2);
  if (variant === 0) {
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(309, 292, 12, Math.PI, 0);
    ctx.stroke();
  }
  // Flowers (right picture: the first flower is purple, not pink).
  const flowers = [40, 120, 200, 280, 440];
  flowers.forEach((x, i) => {
    const color = variant === 1 && i === 0 ? '#a855f7' : '#ec4899';
    for (let p = 0; p < 5; p += 1) {
      const a = (p * Math.PI * 2) / 5;
      circle(ctx, x + Math.cos(a) * 8, 332 + Math.sin(a) * 8, 5, color);
    }
    circle(ctx, x, 332, 5, '#facc15');
    line(ctx, x, 340, x, 356, '#15803d', 3);
  });
}

// ---------------------------------------------------------------------------
// 6. Night Market — stalls, lanterns, string lights, bicycle and a black cat.
// ---------------------------------------------------------------------------
function drawMarket(ctx, variant) {
  rect(ctx, 0, 0, 480, 360, '#2a1e4f');
  rect(ctx, 0, 280, 480, 80, '#3f2d5e');
  // Moon.
  circle(ctx, 420, 55, 22, '#fef3c7');
  circle(ctx, 412, 49, 4, '#e7d98f');
  circle(ctx, 428, 62, 3, '#e7d98f');
  // String lights (right picture: one bulb is dark).
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.quadraticCurveTo(240, 62, 480, 18);
  ctx.stroke();
  for (let i = 0; i < 9; i += 1) {
    const x = 24 + i * 52;
    const y = 18 + Math.sin((i / 8) * Math.PI) * 26;
    const lit = !(variant === 1 && i === 4);
    circle(ctx, x, y + 8, 6, lit ? '#fde047' : '#3f3f46');
  }
  // Fruit stall, left (right picture: one awning stripe is gone, one orange is gone).
  rect(ctx, 40, 150, 150, 12, '#f8fafc');
  for (let i = 0; i < 5; i += 1) {
    if (variant === 1 && i === 2) continue;
    rect(ctx, 40 + i * 30, 138, 30, 12, i % 2 === 0 ? '#dc2626' : '#f8fafc');
  }
  rect(ctx, 40, 162, 150, 8, '#78350f');
  rect(ctx, 48, 170, 134, 70, '#92400e');
  circle(ctx, 90, 216, 11, '#f97316');
  circle(ctx, 114, 216, 11, '#f97316');
  if (variant === 0) circle(ctx, 138, 216, 11, '#f97316');
  circle(ctx, 102, 196, 11, '#f97316');
  circle(ctx, 126, 196, 11, '#f97316');
  ellipse(ctx, 158, 210, 16, 7, '#facc15');
  // Lantern stall, right (right picture: the middle lantern is gone).
  rect(ctx, 300, 150, 150, 12, '#f8fafc');
  for (let i = 0; i < 5; i += 1) {
    rect(ctx, 300 + i * 30, 138, 30, 12, i % 2 === 0 ? '#2563eb' : '#f8fafc');
  }
  rect(ctx, 300, 162, 150, 8, '#78350f');
  rect(ctx, 308, 170, 134, 70, '#92400e');
  ellipse(ctx, 330, 192, 12, 16, '#ef4444');
  if (variant === 0) ellipse(ctx, 366, 192, 12, 16, '#ef4444');
  ellipse(ctx, 402, 192, 12, 16, '#ef4444');
  rect(ctx, 326, 174, 8, 6, '#facc15');
  rect(ctx, 362, 174, 8, 6, '#facc15');
  rect(ctx, 398, 174, 8, 6, '#facc15');
  // Sign board (right picture: the painted fish is gone).
  rect(ctx, 212, 96, 56, 40, '#78350f');
  rect(ctx, 216, 100, 48, 32, '#fde68a');
  if (variant === 0) {
    ellipse(ctx, 240, 116, 12, 7, '#2563eb');
    poly(ctx, [[250, 116], [258, 110], [258, 122]], '#2563eb');
    circle(ctx, 232, 114, 2, '#111827');
  }
  // Bicycle (right picture: the front basket is gone).
  circle(ctx, 92, 306, 18, '#111827');
  circle(ctx, 92, 306, 12, '#f8fafc');
  circle(ctx, 148, 306, 18, '#111827');
  circle(ctx, 148, 306, 12, '#f8fafc');
  line(ctx, 92, 306, 120, 282, '#38bdf8', 4);
  line(ctx, 120, 282, 148, 306, '#38bdf8', 4);
  line(ctx, 120, 282, 138, 282, '#38bdf8', 4);
  line(ctx, 138, 282, 148, 306, '#38bdf8', 4);
  line(ctx, 120, 282, 112, 268, '#38bdf8', 4);
  line(ctx, 138, 282, 152, 272, '#38bdf8', 4);
  if (variant === 0) rect(ctx, 152, 268, 20, 14, '#b45309');
  // Black cat on a crate (right picture: the cat is gone).
  rect(ctx, 420, 308, 40, 26, '#78350f');
  if (variant === 0) {
    ellipse(ctx, 440, 296, 14, 10, '#111827');
    circle(ctx, 450, 284, 8, '#111827');
    poly(ctx, [[444, 278], [447, 270], [450, 278]], '#111827');
    poly(ctx, [[452, 278], [455, 270], [457, 278]], '#111827');
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(428, 296);
    ctx.quadraticCurveTo(418, 290, 420, 280);
    ctx.stroke();
  }
}

export const SCENES = [
  {
    name: 'Harbour Dawn',
    tagline: 'Lighthouse and boats.',
    diffs: [
      { x: 410, y: 55, r: 34, label: 'Sun rays' },
      { x: 192, y: 64, r: 18, label: 'Seagull' },
      { x: 80, y: 35, r: 18, label: 'Flag colour' },
      { x: 320, y: 312, r: 18, label: 'Extra buoy' },
      { x: 200, y: 244, r: 28, label: 'Sail colour' },
      { x: 386, y: 296, r: 18, label: 'Crate' },
      { x: 72, y: 154, r: 14, label: 'Lighthouse window' },
    ],
    draw: drawHarbour,
  },
  {
    name: 'Forest Camp',
    tagline: 'Campfire under stars.',
    diffs: [
      { x: 300, y: 40, r: 14, label: 'Star' },
      { x: 215, y: 244, r: 20, label: 'Tent door' },
      { x: 318, y: 294, r: 18, label: 'Campfire log' },
      { x: 121, y: 303, r: 20, label: 'Backpack colour' },
      { x: 398, y: 146, r: 20, label: 'Owl' },
      { x: 374, y: 254, r: 14, label: 'Marshmallow' },
      { x: 258, y: 224, r: 22, label: 'Extra pine' },
    ],
    draw: drawCamp,
  },
  {
    name: 'Kitchen Morning',
    tagline: 'Breakfast and a cat.',
    diffs: [
      { x: 400, y: 70, r: 28, label: 'Clock hands' },
      { x: 366, y: 198, r: 14, label: 'Apple' },
      { x: 106, y: 202, r: 16, label: 'Teapot handle' },
      { x: 313, y: 213, r: 18, label: 'Extra cup' },
      { x: 72, y: 70, r: 20, label: 'Window sun' },
      { x: 392, y: 290, r: 18, label: 'Cat tail' },
      { x: 240, y: 24, r: 18, label: 'Plant pot' },
    ],
    draw: drawKitchen,
  },
  {
    name: 'Space Station',
    tagline: 'A ringed planet.',
    diffs: [
      { x: 200, y: 90, r: 18, label: 'Planet ring' },
      { x: 306, y: 168, r: 14, label: 'Rocket window' },
      { x: 210, y: 238, r: 16, label: 'Visor colour' },
      { x: 423, y: 263, r: 20, label: 'Solar panel' },
      { x: 250, y: 50, r: 12, label: 'Star' },
      { x: 402, y: 58, r: 24, label: 'Moon craters' },
      { x: 166, y: 221, r: 16, label: 'Tether' },
    ],
    draw: drawSpace,
  },
  {
    name: 'Garden Party',
    tagline: 'Cake, balloons, bees.',
    diffs: [
      { x: 60, y: 52, r: 30, label: 'Sunglasses' },
      { x: 420, y: 168, r: 14, label: 'Apple' },
      { x: 232, y: 96, r: 24, label: 'Balloon' },
      { x: 218, y: 245, r: 16, label: 'Candle' },
      { x: 322, y: 142, r: 16, label: 'Bee' },
      { x: 309, y: 286, r: 18, label: 'Basket handle' },
      { x: 40, y: 332, r: 14, label: 'Flower colour' },
    ],
    draw: drawGarden,
  },
  {
    name: 'Night Market',
    tagline: 'Lanterns, fruit, a cat.',
    diffs: [
      { x: 366, y: 192, r: 18, label: 'Lantern' },
      { x: 162, y: 275, r: 18, label: 'Bike basket' },
      { x: 440, y: 290, r: 20, label: 'Cat' },
      { x: 240, y: 116, r: 22, label: 'Sign fish' },
      { x: 138, y: 216, r: 14, label: 'Orange' },
      { x: 232, y: 48, r: 12, label: 'Dark bulb' },
      { x: 100, y: 144, r: 16, label: 'Awning stripe' },
    ],
    draw: drawMarket,
  },
];
