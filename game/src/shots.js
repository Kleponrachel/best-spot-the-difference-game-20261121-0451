// The screenshot scenes behind ?shot=start|play|lens|end. Each one sets the world to a fixed
// state — the same seed always gives the same frame — so the screenshots are real renders of
// the game's own code: the title, a game in progress with some differences found and some
// still to find, the magnifier at work, and the final results.
import { PANEL, PANEL_LEFT_X, PANEL_RIGHT_X } from './config.js';
import { SCENES } from './scenes.js';

const SCALE_X = PANEL.width / 480;
const SCALE_Y = PANEL.height / 360;

/** Field coordinates of a scene point inside one picture. */
function fieldPoint(panel, sx, sy) {
  const ox = panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X;
  return { x: ox + sx * SCALE_X, y: PANEL.top + sy * SCALE_Y };
}

/**
 * Set `world` to the named scene and return the screen to draw, the best score to show, and
 * the UI state (lens, pointer, crosshair) for the frame.
 */
export function stageShot(name, world) {
  const state = world.state;
  const baseUi = { lensOn: false, pointer: { x: 340, y: 300, inside: false }, crosshair: { x: 340, y: 300, visible: false } };
  if (name === 'play') {
    world.startGame();
    state.found = [0, 2, 4];
    state.timeLeft = 83;
    state.score = 300;
    state.mistakes = 0;
    const at = fieldPoint(1, 320, 312);
    return { screen: 'play', best: 0, ui: { ...baseUi, pointer: { x: at.x, y: at.y, inside: true }, crosshair: { x: at.x, y: at.y, visible: true } } };
  }
  if (name === 'lens') {
    world.startGame();
    world.startScene(2);
    state.found = [0, 3];
    state.timeLeft = 97;
    state.score = 200;
    const apple = SCENES[2].diffs[1];
    const at = fieldPoint(1, apple.x, apple.y);
    return { screen: 'play', best: 0, ui: { lensOn: true, pointer: { x: at.x, y: at.y, inside: true }, crosshair: { x: at.x, y: at.y, visible: false } } };
  }
  if (name === 'end') {
    world.startGame();
    state.sceneResults = SCENES.map((scene, i) => ({
      name: scene.name,
      found: 7,
      total: 7,
      score: 700 + [41, 58, 33, 72, 47, 64][i],
      cleared: true,
    }));
    state.totalScore = state.sceneResults.reduce((sum, r) => sum + r.score, 0);
    state.sceneIndex = 5;
    state.found = [0, 1, 2, 3, 4, 5, 6];
    state.timeLeft = 64;
    state.score = 0;
    state.screen = 'victory';
    return { screen: 'victory', best: 0, ui: baseUi };
  }
  world.reset();
  return { screen: 'title', best: 0, ui: baseUi };
}
