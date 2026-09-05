# C Vogel Designs

A portable, dependency-free website. Open `index.html` directly, or serve this directory with a static web server. No build step, package install, tracking, runtime CDN, or publishing integration is required.

## Local viewing

From this directory, run `python -m http.server 8791 --bind 127.0.0.1`, then visit http://127.0.0.1:8791. An existing parent-managed preview may already occupy that port; do not start another server if so.

## Files

- `index.html`: semantic page, navigation, services, sculpture controls, contact composer.
- `styles.css`: local Archivo display type, charcoal/cyan/red identity, responsive exhibition layout.
- `app.js`: scroll sequence, Canvas 2D perspective geometry, interaction controls, email composer.
- `tests.cjs`: dependency-free Node checks. Run `node tests.cjs`.
- `assets/logo.png`, `assets/Archivo-Bold.ttf`, `assets/poster.jpg`.
- `assets/frames/frame-001.webp` through `frame-096.webp`: the 96 actual generated video frames, 960 × 710. Original footage is approximately 4:3, not 16:9. Canvas drawing uses contain, never crop or CSS perspective substitutes.
- `assets/hero.mp4`: source video retained for portability; the website uses extracted frames rather than unreliable cross-browser video seeking.

## Interactions

- Normal hero is a 280vh sticky scroll scene. Scroll position selects frames 1–96 with bounded mapping; five parallel image loads fetch sparse anchor frames first, then the sequence. While loading, the closest available frame displays. If no frames load, the poster remains visible.
- `Skip the motion` and the keyboard skip link jump to services. Reduced motion eliminates the long sticky scene and keeps the poster. No object auto-rotation or continuous rendering loop.
- Sculpture is genuine locally computed 3D geometry, projected and shaded in Canvas 2D. Drag horizontally or vertically with a mouse; use horizontal drag on touch (vertical page scrolling is retained). Focus the canvas and use arrow keys; Shift makes larger turns, R resets. Knot/orbit and chrome/cyan/red controls work independently. Reset restores shape, finish, and orientation.
- Service inquiry links select the relevant checkbox. Composer builds a real `mailto:me@cvogel.net` URL with selections and encoded brief. It opens the visitor’s configured email app; no backend, data storage, or automatic sending. A direct email link remains available, including without JavaScript. Mailto availability and maximum body length vary by device/email client.
- No invented client work, testimonials, stats, or fake form confirmations. The interactive sculpture is explicitly identified as a form study rather than a client project.

## QA selectors / state

- Hero: `.hero`, `.hero-sticky`, `#hero-canvas`, `#hero-poster`, `#scroll-progress`, `#frame-number`.
- Links: `.skip-link`, `.hero-topline a`, `[data-service-link="Website"]`, `[data-service-link="Merch"]`.
- Sculpture: `#sculpture`, `[data-shape="knot"]`, `[data-shape="orbit"]`, `[data-color="chrome"]`, `[data-color="cyan"]`, `[data-color="red"]`, `#reset-sculpture`.
- Inquiry: `#inquiry-form`, `input[name="service"]`, `#project-brief`, `.email-button`, `#inquiry-status`.
- `window.cvdDebug`: requested `frame`, actual `drawnFrame`, `progress`, `loaded`, `failed`, `reducedMotion`, `sculpture` (rotationX, rotationY, shape, color), and last composed `mailto`.

Verify desktop and mobile widths, keyboard focus, reduced-motion emulation, scroll positions, shape/finish/reset, and composer encoding before deployment. All local paths are relative; keep the assets folder next to the three website files.
