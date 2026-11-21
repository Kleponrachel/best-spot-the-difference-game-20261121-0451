[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Kleponrachel/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Kleponrachel/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

# Twin Worlds — Spot the Difference

Two near-identical pictures sit side by side. Seven things are different. Find them all
before the clock runs out — across six hand-drawn worlds, 42 differences in all.

## The worlds

1. **Harbour Dawn** — a lighthouse, a sailboat, gulls and crates on the pier.
2. **Forest Camp** — a campfire night under the stars, with an owl and a tent.
3. **Kitchen Morning** — breakfast, a cat and a ticking clock.
4. **Space Station** — orbiting a ringed planet with a rocket and an astronaut.
5. **Garden Party** — cake, balloons and bees in the sun.
6. **Night Market** — lanterns, fruit stalls and a black cat.

Every picture is drawn in code (no image files, no borrowed art), so the game runs fully
offline from its own static files.

## How to play

- **Mouse:** click a difference on either picture. A green ring marks it on both.
- **Keyboard:** arrow keys move the crosshair, **Enter** or **Space** clicks where it points.
- **M** toggles the magnifier — a 2x lens that follows your cursor for a closer look.
  Right-click does the same.
- **H** spends a hint and rings the next unfound difference. Three hints per scene.
- **P** pauses, **S** toggles sound, **R** restarts, **N** moves to the next scene.

A scene gives you 120 seconds and three hearts: a wrong click costs a heart and 25 points,
a found difference is worth 100, and clearing a scene pays one point per second left.
The HUD always shows how many you found and how many are left.

## Sounds

All sounds are synthesised live with WebAudio — found, wrong, hint, scene clear and
victory jingles. No audio files, no network.

## Run it

```sh
node serve.ts        # then open http://localhost:8080
```

Hand the entry in with `MAKEFUN_OUTPUT_DIR=out node main.ts` (Node 22).

## Files

- `game/index.html` — the page; `game/src/main.js` boots the loop.
- `game/src/scenes.js` — the six worlds and their 42 differences.
- `game/src/world.js` — the rules: clicks, clock, hearts, hints, score.
- `game/src/render.js` — panels, HUD, markers, magnifier and screens.
- `game/src/input.js` — mouse + keyboard, one crosshair for both.
- `game/src/audio.js` — synthesised sounds.
- `game/src/shots.js` — the four staged screenshot scenes.
- `game/src/config.js`, `game/src/random.js` — tuning and the seeded RNG.
- `main.ts` — copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
