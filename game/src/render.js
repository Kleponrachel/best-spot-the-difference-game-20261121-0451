// Drawing only: the world's state and the current screen in, pixels out. The 1280x720
// playfield is scaled to fit the window and centred. Each picture is painted once per scene
// into its own offscreen canvas (left = original, right = changed), then blitted; markers,
// the hint ring, the magnifier lens and the HUD are drawn over them every frame.
import { FIELD, FONT, LENS, PALETTE, PANEL, PANEL_LEFT_X, PANEL_RIGHT_X, SCENE } from './config.js';
import { SCENES } from './scenes.js';

const SCALE_X = PANEL.width / SCENE.width;
const SCALE_Y = PANEL.height / SCENE.height;

function cachedLabel(prefix) {
  let value = null;
  let text = '';
  return function label(next) {
    if (next !== value) {
      value = next;
      text = prefix + next;
    }
    return text;
  };
}

/** Which picture, if any, the field point (x, y) is over, and where it is in scene space. */
export function fieldToScene(x, y) {
  if (y < PANEL.top || y > PANEL.top + PANEL.height) return null;
  if (x >= PANEL_LEFT_X && x <= PANEL_LEFT_X + PANEL.width) {
    return { panel: 0, sx: (x - PANEL_LEFT_X) / SCALE_X, sy: (y - PANEL.top) / SCALE_Y };
  }
  if (x >= PANEL_RIGHT_X && x <= PANEL_RIGHT_X + PANEL.width) {
    return { panel: 1, sx: (x - PANEL_RIGHT_X) / SCALE_X, sy: (y - PANEL.top) / SCALE_Y };
  }
  return null;
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const leftArt = document.createElement('canvas');
  const rightArt = document.createElement('canvas');
  leftArt.width = PANEL.width;
  leftArt.height = PANEL.height;
  rightArt.width = PANEL.width;
  rightArt.height = PANEL.height;
  let paintedScene = -1;

  const foundLabel = cachedLabel('Found ');
  const scoreLabel = cachedLabel('Score ');
  const timeLabel = cachedLabel('');

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align, weight) {
    const key = size + (weight || '');
    if (!fonts.has(key)) fonts.set(key, `${weight ? weight + ' ' : ''}${size}px ${FONT}`);
    context.font = fonts.get(key);
    context.fillStyle = color;
    context.textAlign = align;
    context.fillText(value, x, y);
  }

  function paintSceneArt(sceneIndex) {
    if (paintedScene === sceneIndex) return;
    paintedScene = sceneIndex;
    const scene = SCENES[sceneIndex];
    const left = leftArt.getContext('2d');
    left.setTransform(SCALE_X, 0, 0, SCALE_Y, 0, 0);
    scene.draw(left, 0);
    const right = rightArt.getContext('2d');
    right.setTransform(SCALE_X, 0, 0, SCALE_Y, 0, 0);
    scene.draw(right, 1);
  }

  function drawMarker(x, y, kind, pulse) {
    const r = 20 + (pulse ? Math.sin(performance.now() / 180) * 2 : 0);
    context.strokeStyle = kind === 'found' ? PALETTE.ring : PALETTE.hint;
    context.lineWidth = 4;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.stroke();
    if (kind === 'found') {
      context.strokeStyle = PALETTE.ring;
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(x - 8, y);
      context.lineTo(x - 2, y + 7);
      context.lineTo(x + 9, y - 6);
      context.stroke();
    }
  }

  function drawPanels(state) {
    paintSceneArt(state.sceneIndex);
    const scene = SCENES[state.sceneIndex];
    const origins = [PANEL_LEFT_X, PANEL_RIGHT_X];
    const arts = [leftArt, rightArt];
    for (let p = 0; p < 2; p += 1) {
      const ox = origins[p];
      context.fillStyle = PALETTE.panel;
      context.fillRect(ox - 6, PANEL.top - 6, PANEL.width + 12, PANEL.height + 12);
      context.drawImage(arts[p], ox, PANEL.top);
      text(p === 0 ? 'PICTURE A' : 'PICTURE B', ox + 12, PANEL.top - 22, 15, PALETTE.muted, 'left', '700');
    }
    // Rings on the differences already found, on both pictures.
    for (const index of state.found) {
      const d = scene.diffs[index];
      for (let p = 0; p < 2; p += 1) {
        drawMarker(origins[p] + d.x * SCALE_X, PANEL.top + d.y * SCALE_Y, 'found', false);
      }
    }
    // A fresh click flashes where it landed, on the picture it landed on.
    if (state.flash !== null && state.flashTimeLeft > 0) {
      const alpha = Math.max(0, state.flashTimeLeft / 0.9);
      context.save();
      context.globalAlpha = alpha;
      if (state.flash.kind === 'found') {
        for (let p = 0; p < 2; p += 1) {
          drawMarker(origins[p] + state.flash.x * SCALE_X, PANEL.top + state.flash.y * SCALE_Y, 'found', false);
        }
      } else {
        const ox = origins[state.flash.panel ?? 0];
        const cx = ox + state.flash.x * SCALE_X;
        const cy = PANEL.top + state.flash.y * SCALE_Y;
        context.strokeStyle = PALETTE.bad;
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(cx - 12, cy - 12);
        context.lineTo(cx + 12, cy + 12);
        context.moveTo(cx + 12, cy - 12);
        context.lineTo(cx - 12, cy + 12);
        context.stroke();
      }
      context.restore();
    }
    // A hint rings the next unfound difference, on both pictures.
    if (state.hintAt >= 0 && state.hintTimeLeft > 0) {
      const d = scene.diffs[state.hintAt];
      for (let p = 0; p < 2; p += 1) {
        drawMarker(origins[p] + d.x * SCALE_X, PANEL.top + d.y * SCALE_Y, 'hint', true);
      }
    }
  }

  function drawLens(state, ui) {
    if (!ui.lensOn) return;
    const at = fieldToScene(ui.pointer.x, ui.pointer.y);
    if (at === null) return;
    const art = at.panel === 0 ? leftArt : rightArt;
    const ox = at.panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X;
    const cx = ui.pointer.x;
    const cy = ui.pointer.y;
    const radius = LENS.radius;
    const srcRadius = radius / LENS.zoom;
    const sx = Math.max(0, Math.min(PANEL.width - srcRadius * 2, at.sx * SCALE_X - srcRadius));
    const sy = Math.max(0, Math.min(PANEL.height - srcRadius * 2, at.sy * SCALE_Y - srcRadius));
    context.save();
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.clip();
    context.drawImage(art, sx, sy, srcRadius * 2, srcRadius * 2, cx - radius, cy - radius, radius * 2, radius * 2);
    context.restore();
    context.strokeStyle = PALETTE.accent;
    context.lineWidth = 4;
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = 'rgba(255,255,255,0.85)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(cx - 10, cy);
    context.lineTo(cx + 10, cy);
    context.moveTo(cx, cy - 10);
    context.lineTo(cx, cy + 10);
    context.stroke();
    text('2x', cx, cy + radius - 12, 15, PALETTE.accent, 'center', '700');
  }

  function drawHud(state, best) {
    const scene = SCENES[state.sceneIndex];
    context.fillStyle = PALETTE.hud;
    context.fillRect(0, 0, FIELD.width, 64);
    context.fillStyle = PALETTE.hudLine;
    context.fillRect(0, 64, FIELD.width, 2);
    context.textBaseline = 'top';
    text('TWIN WORLDS', 24, 12, 26, PALETTE.accent, 'left', '800');
    text(scene.name + '  ·  Scene ' + (state.sceneIndex + 1) + ' of ' + SCENES.length, 24, 42, 15, PALETTE.muted, 'left');
    const remaining = scene.diffs.length - state.found.length;
    const mid = FIELD.width / 2;
    text(foundLabel(state.found.length + '/' + scene.diffs.length), mid - 150, 10, 26, PALETTE.text, 'center', '700');
    text(remaining + ' LEFT', mid + 40, 10, 26, remaining <= 2 ? PALETTE.bad : PALETTE.accent, 'center', '800');
    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = Math.floor(state.timeLeft % 60);
    const timeText = minutes + ':' + String(seconds).padStart(2, '0');
    text(timeLabel(timeText), mid - 150, 40, 16, state.timeLeft <= 15 ? PALETTE.bad : PALETTE.muted, 'center');
    text('Hints ' + state.hintsLeft + '  (H)', mid + 40, 40, 16, PALETTE.muted, 'center');
    text(scoreLabel(state.totalScore + state.score), FIELD.width - 24, 10, 26, PALETTE.text, 'right', '700');
    // Hearts for the mistakes left.
    const heartSize = 18;
    const firstHeart = FIELD.width - 24 - 3 * (heartSize + 8) + 8;
    for (let i = 0; i < 3; i += 1) {
      const hx = firstHeart + i * (heartSize + 8);
      context.fillStyle = i < 3 - state.mistakes ? '#f87171' : '#3a435e';
      context.beginPath();
      context.arc(hx + 6, 48, 6, 0, Math.PI * 2);
      context.arc(hx + 13, 48, 6, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.moveTo(hx, 49);
      context.lineTo(hx + 9, 62);
      context.lineTo(hx + 19, 49);
      context.closePath();
      context.fill();
    }
    void best;
  }

  function drawChips(state) {
    const scene = SCENES[state.sceneIndex];
    context.textBaseline = 'top';
    text('Found:', 60, 540, 16, PALETTE.muted, 'left', '700');
    let x = 130;
    for (let i = 0; i < scene.diffs.length; i += 1) {
      const label = scene.diffs[i].label;
      const found = state.found.includes(i);
      const width = 14 + label.length * 8;
      context.fillStyle = found ? '#1f3d2b' : '#232c42';
      context.fillRect(x, 534, width, 28);
      context.strokeStyle = found ? PALETTE.ring : PALETTE.hudLine;
      context.lineWidth = 1;
      context.strokeRect(x, 534, width, 28);
      text((found ? '✓ ' : '· ') + label, x + 8, 540, 15, found ? PALETTE.good : PALETTE.muted, 'left');
      x += width + 8;
      if (x > FIELD.width - 120) break;
    }
    text('Click a difference  ·  Arrows + Enter work too  ·  M magnifier  ·  H hint  ·  P pause  ·  S sound', FIELD.width / 2, 580, 16, PALETTE.muted, 'center');
  }

  function drawCrosshair(ui) {
    if (!ui.crosshair.visible) return;
    const { x, y } = ui.crosshair;
    context.strokeStyle = PALETTE.cursor;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x, y, 12, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(x - 18, y);
    context.lineTo(x - 7, y);
    context.moveTo(x + 7, y);
    context.lineTo(x + 18, y);
    context.moveTo(x, y - 18);
    context.lineTo(x, y - 7);
    context.moveTo(x, y + 7);
    context.lineTo(x, y + 18);
    context.stroke();
  }

  function drawPanelBox(title, lines, prompt, accent) {
    const width = 680;
    const height = 150 + lines.length * 32;
    const x = (FIELD.width - width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = 'rgba(10, 14, 24, 0.82)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    context.fillStyle = PALETTE.panel;
    context.fillRect(x, y, width, height);
    context.strokeStyle = accent;
    context.lineWidth = 3;
    context.strokeRect(x, y, width, height);
    context.textBaseline = 'alphabetic';
    text(title, FIELD.width / 2, y + 72, 44, PALETTE.text, 'center', '800');
    for (let i = 0; i < lines.length; i += 1) {
      text(lines[i], FIELD.width / 2, y + 122 + i * 32, 20, PALETTE.muted, 'center');
    }
    text(prompt, FIELD.width / 2, y + height - 34, 20, accent, 'center', '700');
  }

  function drawTitle(state, best) {
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    context.textBaseline = 'alphabetic';
    text('TWIN WORLDS', FIELD.width / 2, 108, 72, PALETTE.accent, 'center', '800');
    text('Spot the Difference  ·  six hand-drawn worlds, seven changes in each', FIELD.width / 2, 148, 22, PALETTE.text, 'center');
    text('Two pictures sit side by side. Seven things are different. Find them all before the clock runs out.', FIELD.width / 2, 180, 18, PALETTE.muted, 'center');
    // Scene cards.
    const cardW = 190;
    const cardH = 104;
    const gap = 16;
    const totalW = 3 * cardW + 2 * gap;
    const startX = (FIELD.width - totalW) / 2;
    for (let i = 0; i < SCENES.length; i += 1) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = startX + col * (cardW + gap);
      const y = 218 + row * (cardH + gap);
      const selected = state.selectedScene === i;
      context.fillStyle = selected ? '#2e3a5c' : PALETTE.panel;
      context.fillRect(x, y, cardW, cardH);
      context.strokeStyle = selected ? PALETTE.accent : PALETTE.hudLine;
      context.lineWidth = selected ? 3 : 1;
      context.strokeRect(x, y, cardW, cardH);
      text((i + 1) + '. ' + SCENES[i].name, x + 14, y + 30, 17, PALETTE.text, 'left', '700');
      text(SCENES[i].tagline, x + 14, y + 56, 13, PALETTE.muted, 'left');
      text('7 differences', x + 14, y + 82, 14, PALETTE.accent, 'left');
    }
    text('Click a scene, or press Enter to play them in order', FIELD.width / 2, 486, 18, PALETTE.muted, 'center');
    text('Mouse: click a difference  ·  Keyboard: arrows move, Enter clicks, M magnifier, H hint, P pause', FIELD.width / 2, 516, 17, PALETTE.muted, 'center');
    text('Wrong clicks cost a heart — three wrong clicks end the scene', FIELD.width / 2, 544, 17, PALETTE.muted, 'center');
    if (best > 0) text('Best total score: ' + best, FIELD.width / 2, 596, 20, PALETTE.accent, 'center', '700');
    text('Click or press Enter to start', FIELD.width / 2, 648, 22, PALETTE.accent, 'center', '700');
  }

  function draw(state, screen, best, ui) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    if (screen === 'title') {
      drawTitle(state, best);
      return;
    }
    drawHud(state, best);
    drawPanels(state);
    drawChips(state);
    drawLens(state, ui);
    drawCrosshair(ui);
    if (screen === 'paused') {
      drawPanelBox('Paused', ['The clock is waiting for you.'], 'Press P or click to carry on', PALETTE.accent);
    } else if (screen === 'scene-clear') {
      const scene = SCENES[state.sceneIndex];
      drawPanelBox('Scene clear!', [
        scene.name + ' — all 7 differences found.',
        'Scene score ' + state.score + '  ·  Total ' + state.totalScore,
      ], state.sceneIndex + 1 >= SCENES.length ? 'Press N for the final results' : 'Press N for the next scene', PALETTE.good);
    } else if (screen === 'scene-end') {
      const scene = SCENES[state.sceneIndex];
      drawPanelBox(state.timeLeft <= 0 ? "Time's up!" : 'Out of tries!', [
        scene.name + ' — you found ' + state.found.length + ' of 7 differences.',
        'Scene score ' + state.score + '  ·  Total ' + state.totalScore,
      ], state.sceneIndex + 1 >= SCENES.length ? 'Press N for the final results' : 'Press N for the next scene', PALETTE.bad);
    } else if (screen === 'victory') {
      const lines = state.sceneResults.map((r) => `${r.name}: ${r.found}/${r.total}  ·  ${r.score} points${r.cleared ? '  ·  cleared' : ''}`);
      lines.push('');
      lines.push('Total score ' + state.totalScore + (state.totalScore > best ? '  ·  a new best!' : '  ·  best ' + best));
      drawPanelBox('You found them all!', lines, 'Press R to play again', PALETTE.accent);
    }
  }

  resize();
  window.addEventListener('resize', resize);

  /** Convert a point in CSS pixels, relative to the canvas element, to field coordinates. */
  function toField(cssX, cssY) {
    const rect = canvas.getBoundingClientRect();
    const bx = cssX * (canvas.width / rect.width);
    const by = cssY * (canvas.height / rect.height);
    return { x: (bx - view.x) / view.scale, y: (by - view.y) / view.scale };
  }

  return { draw, toField };
}
