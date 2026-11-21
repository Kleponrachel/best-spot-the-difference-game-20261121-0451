// The game's state and rules, with no drawing in it: which scene is up, which differences are
// found, the clock, the mistakes, the hints and the score. A click is tested against both
// pictures at once, so finding a difference on either side counts, and its ring is drawn on
// both. A scene ends when all seven are found or the clock runs out; the game ends after the
// last scene, and the total decides the victory screen.
import { CLICK_RADIUS, HINTS_PER_SCENE, MAX_MISTAKES, POINTS_FOUND, POINTS_MISTAKE, POINTS_TIME_BONUS, SCENE_SECONDS } from './config.js';
import { SCENES } from './scenes.js';

export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_SCENE_CLEAR = 4;
export const EVENT_SCENE_END = 8;
export const EVENT_VICTORY = 16;

export function createWorld(random) {
  const state = {
    screen: 'title',
    sceneIndex: 0,
    found: [],
    mistakes: 0,
    timeLeft: SCENE_SECONDS,
    score: 0,
    totalScore: 0,
    hintsLeft: HINTS_PER_SCENE,
    hintAt: -1,
    hintTimeLeft: 0,
    flash: null,
    flashTimeLeft: 0,
    selectedScene: 0,
    sceneResults: [],
    best: 0,
  };

  function scene() {
    return SCENES[state.sceneIndex];
  }

  function foundCount() {
    return state.found.length;
  }

  function remainingCount() {
    return scene().diffs.length - state.found.length;
  }

  function startScene(index) {
    state.sceneIndex = index;
    state.found = [];
    state.mistakes = 0;
    state.timeLeft = SCENE_SECONDS;
    state.hintsLeft = HINTS_PER_SCENE;
    state.hintAt = -1;
    state.hintTimeLeft = 0;
    state.flash = null;
    state.flashTimeLeft = 0;
    state.score = 0;
    state.screen = 'play';
  }

  function startGame() {
    state.totalScore = 0;
    state.sceneResults = [];
    startScene(0);
  }

  /** Start a fresh run at one scene (the title screen's cards), in order from there. */
  function startFromScene(index) {
    state.totalScore = 0;
    state.sceneResults = [];
    startScene(index);
  }

  /** A click at scene coordinates (sx, sy) inside one picture (`panel` 0 or 1). Returns an event bitmask. */
  function clickAt(sx, sy, panel) {
    if (state.screen !== 'play') return 0;
    const diffs = scene().diffs;
    for (let i = 0; i < diffs.length; i += 1) {
      if (state.found.includes(i)) continue;
      const d = diffs[i];
      const dx = sx - d.x;
      const dy = sy - d.y;
      const reach = Math.max(d.r, CLICK_RADIUS) + 6;
      if (dx * dx + dy * dy <= reach * reach) {
        state.found.push(i);
        state.score += POINTS_FOUND;
        state.flash = { x: d.x, y: d.y, panel, kind: 'found' };
        state.flashTimeLeft = 0.9;
        if (state.found.length === diffs.length) {
          const bonus = Math.round(state.timeLeft) * POINTS_TIME_BONUS;
          state.score += bonus;
          state.totalScore += state.score;
          state.sceneResults.push({ name: scene().name, found: diffs.length, total: diffs.length, score: state.score, cleared: true });
          state.screen = 'scene-clear';
          return EVENT_FOUND | EVENT_SCENE_CLEAR;
        }
        return EVENT_FOUND;
      }
    }
    state.mistakes += 1;
    state.score = Math.max(0, state.score - POINTS_MISTAKE);
    state.flash = { x: sx, y: sy, panel, kind: 'wrong' };
    state.flashTimeLeft = 0.9;
    if (state.mistakes >= MAX_MISTAKES) {
      state.totalScore += state.score;
      state.sceneResults.push({ name: scene().name, found: state.found.length, total: scene().diffs.length, score: state.score, cleared: false });
      state.screen = state.sceneIndex + 1 >= SCENES.length ? 'victory' : 'scene-end';
      return EVENT_WRONG | EVENT_SCENE_END;
    }
    return EVENT_WRONG;
  }

  function useHint() {
    if (state.screen !== 'play' || state.hintsLeft <= 0) return false;
    const diffs = scene().diffs;
    for (let i = 0; i < diffs.length; i += 1) {
      if (!state.found.includes(i)) {
        state.hintAt = i;
        state.hintTimeLeft = 4;
        state.hintsLeft -= 1;
        return true;
      }
    }
    return false;
  }

  function nextScene() {
    if (state.sceneIndex + 1 >= SCENES.length) {
      state.screen = 'victory';
      return;
    }
    startScene(state.sceneIndex + 1);
  }

  /** Advance the clock and the fading flashes; returns an event bitmask. */
  function step(dt) {
    if (state.screen !== 'play') return 0;
    state.timeLeft -= dt;
    if (state.flashTimeLeft > 0) state.flashTimeLeft -= dt;
    if (state.hintTimeLeft > 0) {
      state.hintTimeLeft -= dt;
      if (state.hintTimeLeft <= 0) state.hintAt = -1;
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.totalScore += state.score;
      state.sceneResults.push({ name: scene().name, found: state.found.length, total: scene().diffs.length, score: state.score, cleared: false });
      state.screen = state.sceneIndex + 1 >= SCENES.length ? 'victory' : 'scene-end';
      return EVENT_SCENE_END;
    }
    return 0;
  }

  function reset() {
    state.screen = 'title';
    state.sceneIndex = 0;
    state.selectedScene = 0;
    state.totalScore = 0;
    state.sceneResults = [];
    startScene(0);
    state.screen = 'title';
  }

  return {
    state,
    scene,
    sceneCount: SCENES.length,
    foundCount,
    remainingCount,
    startGame,
    startFromScene,
    startScene,
    clickAt,
    useHint,
    nextScene,
    step,
    reset,
    random,
  };
}
