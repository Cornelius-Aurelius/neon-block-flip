# Neon Block Flip ∞ OMEGA — 3D Edition

An original single-page 3D-style rolling-block puzzle game by Cornelius Aurelius, inspired by the **mechanics** of classic 2×1 block-rolling puzzles. The stage layouts, art, code, names and presentation are original.

**Play:** https://cornelius-aurelius.github.io/neon-block-flip/

## Goal and movement

Tip a 1 × 1 × 2 metal prism across floating platforms and make it stand **upright over the illuminated single-square exit hole**. Every move uses physically correct 90° tipping geometry:

- Upright block at `(x, y)` tipped right occupies `(x+1, y)` and `(x+2, y)`.
- Upright block tipped left occupies `(x-2, y)` and `(x-1, y)`.
- A lying block tips onto its end when rolled along its long axis; it rolls sideways without changing orientation along its short axis.
- If either occupied square is void or an inactive bridge, the block falls and the stage restarts.
- Fragile tiles support a lying block, **not an upright block**.
- Standing on an amber switch changes bridge state. Standing on a portal teleports the block to its paired portal.
- To finish, the prism must be upright in the exit; merely passing over the hole does not complete the level.

## Controls

- Arrow keys / WASD: roll prism
- Swipe on game board: roll prism
- On-screen arrow pad: touch or mouse input. On phones, a compact pad sits directly underneath the board.
- **Z:** undo last valid move
- **R:** restart level
- **H:** one-step hint from your **current** position
- Theme button: cycle Aurora / Voltage / Candy colour schemes. All special tiles have distinct glyphs as well as colour.
- Sound button: optional synthesised audio; muted by default.

## Progression and fairness

- **33 unique**, deterministically generated, static level layouts across 6 chapters.
- All 33 levels are validated via an **independent shortest-path breadth-first-search solver**.
- Switch stages require their bridge to finish; portal stages require teleportation.
- 1–3 star mastery for each stage, based on moves, hints and falls. 99 stars can be collected.
- Scores and unlocked levels are saved locally in your browser. The old version’s level unlocks are retained where available, but scores from the old **incorrect physics engine** are not migrated.
- No account, adverts, analytics, cookies, asset downloads, JavaScript dependencies or external network calls are required to run the game.

## Test locally

Open `index.html` in a browser, or serve the folder using any static-file server. In Node.js ≥ 18:

```bash
node --test tests/levels.test.js
```

Tests verify: 33 distinct valid maps, legal stored solutions, shortest paths using an independent physics implementation, mechanics essential for switch and portal puzzles, proper rolling geometry, and standalone GitHub Pages suitability. Browser tests were additionally performed at narrow-phone, mobile, tablet and desktop sizes, including a full 33-stage real-engine playthrough.

## Deployment

GitHub Pages: Settings → Pages → `Deploy from a branch` → `main` / `(root)`. GitHub Pages serves the `index.html` directly. No build step or custom GitHub Action is needed.

## Content ownership

© Cornelius Aurelius. Game title, artwork, code and level layouts are original. The game is not affiliated with the Bloxorz franchise.