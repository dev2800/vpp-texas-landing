# VPP Texas — Landing Page

Immersive landing page for a Virtual Power Plant powered by Sonnen batteries and home solar. Built for Texas homeowners.

## Stack

- **Vite** + Vanilla JS (ES Modules)
- **Three.js** (r163) — hero scene, voronoi background, exploded battery view, god-ray shader
- **GSAP** + ScrollTrigger — scroll-driven animations, pinned sections, horizontal scroll
- **GLSL** — custom fragment shaders for volumetric god rays + voronoi background
- **Web Audio API** — optional ambient hum that shifts with scroll
- Inline **SVG** for the icon micro-animations (lighter than Lottie for this use)

## Sections

1. **Hero** — particle explosion forms the Texas outline, then reassembles into a Sonnen battery with an orbiting ring of home nodes
2. **The Problem** — Texas grid map with outage cascade on scroll
3. **The Solution** — Sun → Battery → Home → Grid → Credits with counters
4. **Social Proof** — rotating 3D vortex of testimonial cards
5. **How It Works** — horizontally-scrolling three-step explainer
6. **The Numbers** — animated voronoi background behind counted-up stats
7. **Battery Closeup** — pinned exploded-view of the Sonnen unit
8. **Final CTA** — pulsing grid background, rippling button

## Features

- Custom glowing cursor with light trail
- Charge-bar loading screen with radial wipe
- Scroll progress indicator on the left edge
- Ambient audio toggle (Web Audio, OFF by default)
- `prefers-reduced-motion` fallbacks throughout
- Mobile: gyroscope parallax, halved particle count, vertical card stack instead of horizontal scroll, pinch-to-explode the battery
- DPR capped at 2 (1.5 for low-power scenes) to prevent GPU overload on phones
- CSS variable `--accent-primary` breathes between cool and warm every 4s

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Vercel: connected via GitHub. Push to `main` to deploy.
