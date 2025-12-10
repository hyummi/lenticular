# Lenticular Parallax Demo

This is a single-page lenticular effect similar to [lenticular-santa.netlify.app](https://lenticular-santa.netlify.app/) that uses iPhone motion sensors for parallax and falls back to pointer movement on desktop.

## Quick start

1) Open `index.html` in Safari on iPhone and tap **Enable motion** to grant gyroscope access.
2) Tilt the phone to see the two layers shift; tap **Swap layers** to flip front/back.
3) On desktop, hover over the card to preview the effect (pointer fallback).

## Customize

- Replace the two background images in `style.css`:
  - `.layer-front` for the foreground
  - `.layer-back` for the background
- Tweak parallax strength in `main.js` (`config.depthFront`, `config.depthBack`, `config.maxTilt`).
- Adjust sizing/rounding in `.card` inside `style.css`.

## How it works

- iOS requires a user gesture to access motion sensors. The **Enable motion** button calls `DeviceMotionEvent.requestPermission()` when available, then listens to `deviceorientation`.
- Motion data is normalized and applied as 3D translations on two layers with different depths for a lenticular shift.
- Pointer events are used as a fallback when sensors are unavailable or permission is denied.

## Notes

- Host the files anywhere static (Netlify, Vercel, GitHub Pages). No build step is required.
- Ensure the site is served over HTTPS on iOS so motion permissions are available.

