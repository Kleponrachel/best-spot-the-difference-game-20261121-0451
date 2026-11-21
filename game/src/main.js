// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s steps,
// and the renderer paints what is there. The game moves between title, play, paused,
// scene-clear, scene-end and victory screens.
//
// ?seed=N fixes the session (the scenes are drawn, not random, so any seed gives the same
// pictures). ?shot=start|play|lens|end (with &seed=N) stages that scene instead of running the
// loop, paints it twice and sets window.__shotReady for a screenshot.
import { FIELD, BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_FOUND, EVENT_SCENE_CLEAR, EVENT_SCENE_END, EVENT_WRONG } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_LENS, ACTION_NEXT, ACTION_PAUSE, ACTION_RESTART, ACTION_SOUND, createInput } from './input.js';
import { createRenderer, fieldToScene } from './render.js';
import { stageShot } from './shots.js';
import { createAudio } from './audio.js';

const MAX_FRAME = 0.25;

// The title screen's scene cards, laid out exactly as the renderer draws them.
const CARD = { width: 190, height: 104, gap: 16, top: 218 };
const CARD_START_X = (FIELD.width - (3 * CARD.width + 2 * CARD.gap)) / 2;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();
const state = world.state;

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, scene.ui);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, onPointer, renderer.toField);
  let screen = 'title';
  let best = readBest();
  let lensOn = false;
  let accumulator = 0;
  let last = performance.now();

  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  // Screen readers (and anyone watching the page's text) hear the screen changes and each hit.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.startGame();
    screen = 'play';
    announce(`Playing ${world.scene().name}. Find 7 differences.`);
  }

  function startFromScene(index) {
    world.startFromScene(index);
    screen = 'play';
    announce(`Playing ${world.scene().name}. Find 7 differences.`);
  }

  function endToVictory() {
    screen = 'victory';
    if (state.totalScore > best) {
      best = state.totalScore;
      saveBest(best);
    }
    announce(`Finished. Total score ${state.totalScore}. Best ${best}.`);
  }

  /** A click at field coordinates (x, y): what it does depends on the screen. */
  function onPointer(x, y, button) {
    if (screen === 'title') {
      for (let i = 0; i < world.sceneCount; i += 1) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = CARD_START_X + col * (CARD.width + CARD.gap);
        const cy = CARD.top + row * (CARD.height + CARD.gap);
        if (x >= cx && x <= cx + CARD.width && y >= cy && y <= cy + CARD.height) {
          audio.click();
          startFromScene(i);
          return;
        }
      }
      audio.click();
      startGame();
      return;
    }
    if (screen === 'play') {
      if (button === 2) {
        lensOn = !lensOn;
        announce(lensOn ? 'Magnifier on.' : 'Magnifier off.');
        return;
      }
      const at = fieldToScene(x, y);
      if (at === null) return;
      const events = world.clickAt(at.sx, at.sy, at.panel);
      if (events & EVENT_FOUND) {
        audio.found();
        announce(`${world.foundCount()} of 7 found, ${world.remainingCount()} left.`);
      } else if (events & EVENT_WRONG) {
        audio.wrong();
        announce(`Not a difference. ${3 - state.mistakes} tries left.`);
      }
      if (events & EVENT_SCENE_CLEAR) {
        audio.sceneClear();
        screen = 'scene-clear';
        announce(`Scene clear. Score ${state.score}.`);
      } else if (events & EVENT_SCENE_END) {
        audio.gameOver();
        if (state.screen === 'victory') endToVictory();
        else {
          screen = state.screen;
          announce('Scene over.');
        }
      }
      return;
    }
    if (screen === 'paused') {
      screen = 'play';
      announce('Playing.');
      return;
    }
    if (screen === 'scene-clear' || screen === 'scene-end') {
      advance();
      return;
    }
    if (screen === 'victory') {
      audio.click();
      startGame();
    }
  }

  function advance() {
    if (state.sceneIndex + 1 >= world.sceneCount) {
      endToVictory();
      return;
    }
    world.nextScene();
    screen = 'play';
    announce(`Playing ${world.scene().name}. Find 7 differences.`);
  }

  function clickAtCrosshair() {
    const at = fieldToScene(input.crosshair.x, input.crosshair.y);
    if (at === null) return;
    onPointer(input.crosshair.x, input.crosshair.y, 0);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_SOUND) {
      const on = audio.toggle();
      announce(on ? 'Sound on.' : 'Sound off.');
    }
    if (actions & ACTION_LENS && (screen === 'play' || screen === 'paused')) {
      lensOn = !lensOn;
      announce(lensOn ? 'Magnifier on.' : 'Magnifier off.');
    }
    if (actions & ACTION_RESTART && (screen === 'victory' || screen === 'scene-clear' || screen === 'scene-end')) {
      audio.click();
      startGame();
      return;
    }
    if (actions & ACTION_CONFIRM) {
      if (screen === 'title') startGame();
      else if (screen === 'play') clickAtCrosshair();
      else if (screen === 'paused') screen = 'play';
      else if (screen === 'scene-clear' || screen === 'scene-end') advance();
      else if (screen === 'victory') startGame();
    }
    if (actions & ACTION_PAUSE) {
      if (screen === 'play') {
        screen = 'paused';
        announce('Paused.');
      } else if (screen === 'paused') {
        screen = 'play';
        announce('Playing.');
      }
    }
    if (actions & ACTION_HINT && screen === 'play') {
      if (world.useHint()) {
        audio.hint();
        announce('Hint: look at the ringed difference.');
      }
    }
    if (actions & ACTION_NEXT && (screen === 'scene-clear' || screen === 'scene-end')) advance();
  }

  function step() {
    const events = world.step(STEP);
    if (events & EVENT_SCENE_END) {
      audio.gameOver();
      if (state.screen === 'victory') endToVictory();
      else {
        screen = state.screen;
        announce('Scene over.');
      }
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const frameDt = Math.min((now - last) / 1000, MAX_FRAME);
    accumulator += frameDt;
    last = now;
    handleActions();
    if (screen === 'play') {
      input.moveCrosshair(frameDt, input.shiftHeld());
      while (accumulator >= STEP) {
        step();
        accumulator -= STEP;
        if (screen !== 'play') break;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(state, screen, best, {
      lensOn: screen === 'play' && lensOn,
      pointer: input.pointer,
      crosshair: input.crosshair,
    });
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === 'play') {
      screen = 'paused';
      announce('Paused.');
    }
  });

  // A small handle for automated checks (and nothing else): the live state, read-only use.
  window.__twinWorlds = {
    state,
    world,
    get screen() {
      return screen;
    },
    get lensOn() {
      return lensOn;
    },
  };

  announce('Twin Worlds. Spot the difference. Press Enter or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
