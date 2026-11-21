// Every tuning number and colour for Twin Worlds, in one place. The playfield is a fixed
// 1280x720 logical area; the renderer scales it to the window, so no rule below depends on the
// screen size. Each picture panel is 560x420 on the field; the scenes themselves are drawn in a
// 480x360 space and scaled up, so a difference's coordinates are always in that 480x360 space.
export const FIELD = { width: 1280, height: 720 };

export const PANEL = { width: 560, height: 420, gap: 40, top: 92 };
export const PANEL_LEFT_X = (FIELD.width - (PANEL.width * 2 + PANEL.gap)) / 2;
export const PANEL_RIGHT_X = PANEL_LEFT_X + PANEL.width + PANEL.gap;
export const SCENE = { width: 480, height: 360 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** Seconds on the clock for one scene, and how many wrong clicks end a scene early. */
export const SCENE_SECONDS = 120;
export const MAX_MISTAKES = 3;
/** Hints per scene; a hint rings the next unfound difference for a few seconds. */
export const HINTS_PER_SCENE = 3;
export const HINT_SECONDS = 4;

/** Points for a found difference, plus one point per second left when a scene is cleared. */
export const POINTS_FOUND = 100;
export const POINTS_TIME_BONUS = 1;
/** A wrong click costs points, never below zero for the scene. */
export const POINTS_MISTAKE = 25;
/** How far, in scene pixels, a click may land from a difference's centre and still count. */
export const CLICK_RADIUS = 30;

/** The magnifier lens: radius on the field, and how much it zooms the picture. */
export const LENS = { radius: 96, zoom: 2 };

export const PALETTE = {
  backdrop: '#141a26',
  hud: '#1d2436',
  hudLine: '#2c3752',
  panel: '#232c42',
  text: '#f2f5fa',
  muted: '#9aa5bd',
  accent: '#ffd166',
  good: '#4ade80',
  bad: '#f87171',
  ring: '#4ade80',
  hint: '#ffd166',
  cursor: '#ffffff',
  button: '#2e3a5c',
  buttonHot: '#3d4f7d',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best total score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-worlds.best';
