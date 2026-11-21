// Keyboard and pointer input. Held arrow keys steer the crosshair; one-shot presses (start,
// pause, hint, magnifier, confirm a click at the crosshair) are queued as bit flags and taken
// once by the loop, so a press between two frames is never lost and never counted twice. The
// pointer drives the same crosshair, so mouse and keyboard play the same game.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_LENS = 8;
export const ACTION_NEXT = 16;
export const ACTION_SOUND = 32;
export const ACTION_RESTART = 64;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const HINT = new Set(['KeyH']);
const LENS = new Set(['KeyM']);
const NEXT = new Set(['KeyN']);
const SOUND = new Set(['KeyS']);
const RESTART = new Set(['KeyR']);
const ARROWS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

export function createInput(target, onPointer, toField) {
  let actions = 0;
  const held = new Set();
  // The crosshair lives in field coordinates; it starts in the middle of the left picture.
  const crosshair = { x: 340, y: 300, visible: false };
  const pointer = { x: 340, y: 300, inside: false };

  /** Convert a pointer event to field coordinates through the renderer's view. */
  function fieldOf(event) {
    const rect = target.getBoundingClientRect();
    return toField(event.clientX - rect.left, event.clientY - rect.top);
  }

  window.addEventListener('keydown', (event) => {
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      held.add(event.code);
      return;
    }
    if (ARROWS.has(event.code)) {
      held.add(event.code);
      crosshair.visible = true;
      event.preventDefault();
      return;
    }
    if (event.repeat) return;
    if (CONFIRM.has(event.code)) actions |= ACTION_CONFIRM;
    else if (PAUSE.has(event.code)) actions |= ACTION_PAUSE;
    else if (HINT.has(event.code)) actions |= ACTION_HINT;
    else if (LENS.has(event.code)) actions |= ACTION_LENS;
    else if (NEXT.has(event.code)) actions |= ACTION_NEXT;
    else if (SOUND.has(event.code)) actions |= ACTION_SOUND;
    else if (RESTART.has(event.code)) actions |= ACTION_RESTART;
    else return;
    crosshair.visible = true;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    held.delete(event.code);
  });
  window.addEventListener('blur', () => {
    held.clear();
  });

  target.addEventListener('pointermove', (event) => {
    const at = fieldOf(event);
    pointer.x = at.x;
    pointer.y = at.y;
    pointer.inside = true;
    crosshair.x = at.x;
    crosshair.y = at.y;
  });
  target.addEventListener('pointerdown', (event) => {
    const at = fieldOf(event);
    crosshair.x = at.x;
    crosshair.y = at.y;
    crosshair.visible = true;
    onPointer(at.x, at.y, event.button);
  });

  return {
    crosshair,
    pointer,
    /** Pixels per second the crosshair moves; Shift doubles it. */
    moveCrosshair(dt, shift) {
      const speed = shift ? 640 : 320;
      if (held.has('ArrowLeft')) crosshair.x -= speed * dt;
      if (held.has('ArrowRight')) crosshair.x += speed * dt;
      if (held.has('ArrowUp')) crosshair.y -= speed * dt;
      if (held.has('ArrowDown')) crosshair.y += speed * dt;
      crosshair.x = Math.max(0, Math.min(1280, crosshair.x));
      crosshair.y = Math.max(0, Math.min(720, crosshair.y));
      if (held.size > 0) {
        pointer.x = crosshair.x;
        pointer.y = crosshair.y;
      }
    },
    shiftHeld() {
      return held.has('ShiftLeft') || held.has('ShiftRight');
    },
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
