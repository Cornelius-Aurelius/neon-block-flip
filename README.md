# Neon Block Flip ∞ OMEGA

A free, self-contained rolling-block puzzle game by Cornelius Aurelius. Built with HTML, CSS and JavaScript; no build tools, network dependencies, accounts or advertising required.

## Play

Open `index.html` in a modern browser or publish the repository using GitHub Pages.

**Goal:** Roll the cyan prism onto the green goal tile in an upright position.

- Keyboard: arrow keys or WASD.
- Phone/tablet: swipe on the game board or use the on-screen direction pad.
- Undo: `Z` or Undo button. Restart: `R` or Restart button.
- **Fragile tile:** holds a lying prism but breaks under an upright prism.
- **Switch:** standing upright toggles the bridge tiles.
- **Bridge:** solid only while activated.
- **Portal:** standing upright on one teleports the prism to its pair.
- The void causes a fall and restarts the chamber.

## What's included

- Thirty unique puzzles (5×5 to 8×8). Every board has been checked with a shortest-path solver, including bridge, fragile and portal rules.
- Move target, best score, level unlocks, level selection and local on-device progress.
- Keyboard, touch direction pad and swipe controls.
- Optional generated sound. Sound is muted by default.
- Responsive high-DPI canvas, reduced-motion support, accessible labels and a help guide.
- No third-party trackers, packages, CDNs, or external images.

## Development and testing

The runtime is intentionally kept in one `index.html` file for simple static hosting.

To verify the 30 puzzles, use Node 18+:

```sh
node --test tests/levels.test.js
```

To test the interface, open the game on mobile and desktop; verify directional buttons, keyboard, swipe, undo, reset, win/next level, help and level selection. The browser's localStorage may be cleared to start from level 1.

## Publishing

In your GitHub repository, choose **Settings → Pages**, then deploy from the `main` branch's root after merging the upgrade pull request. Confirm the exact published URL and test the hosted site before adding it to your [Cornelius Aurelius portfolio](https://corneliusaurelius.com/).

## Creator

© Cornelius Aurelius. [corneliusaurelius.com](https://corneliusaurelius.com/)