# GAME DESIGN: SYNTH SURGE: NEON OMEGA

## 1. Game Overview & Pitch
**Title:** *SYNTH SURGE: NEON OMEGA*  
**Genre:** Top-down 2D neon arena wave-survival shooter  
**Pitch:** In the glowing digital abyss of the Quantum Grid, rogue cyber-anomalies threaten to collapse the mainframe. Pilot a luminous vector vessel through 10 escalating waves of hostile code-forms, harness tactical card upgrades between waves, and annihilate the Apex Core in a dazzling display of synthwave combat. Featuring crisp responsive controls, fully synthesized retro audio, and deep arcade action.

---

## 2. Goal and Rules
- **Objective:** Survive 10 waves of hostile enemy swarms, defeat the Wave 10 Boss (*Apex Core*), and achieve the highest score possible.
- **Core Loop:** Combat waves $\rightarrow$ Collect Energy Drops $\rightarrow$ Select 1 of 3 Upgrade Cards between waves $\rightarrow$ Face tougher waves $\rightarrow$ Victory or Defeat.
- **Rules:**
  - The player starts with 100 Health. Taking damage from enemy contact or projectiles reduces health.
  - When health reaches 0, the run ends in Game Over.
  - Destroying enemies awards points, increases the combo multiplier, and drops energy/score pickups.
  - Surviving all 10 waves and destroying the Boss constitutes a win.

---

## 3. Controls
- **Movement:** WASD or Arrow Keys (smooth 8-way vector movement with inertia damping).
- **Aiming:** Mouse cursor tracking relative to canvas center.
- **Firing:** Hold Left Mouse Click or Spacebar (automatic rate-of-fire laser pulses).
- **Pause:** `ESC` or `P` key.
- **Menu Interaction:** Mouse click or `ENTER` on buttons and upgrade cards.

---

## 4. Enemy Bestiary (5 Distinct Types + Boss)
1. **Glowite (Chaser):** Fast, aggressive swarming drone that tracks the player in straight lines with agile steering.
2. **Vexar (Shooter):** Ranged hoverer that maintains distance and periodically fires targeted plasma bolts at the player's position.
3. **Split-Node (Splitter):** Armored carrier unit. When destroyed, it splits immediately into two faster, smaller *Fragment-Sparks*.
4. **Goliath-X (Brute):** Slow, heavy-duty tank with high health and devastating contact damage, absorbing heavy weapon fire.
5. **Phantasm (Dasher):** Stealthy cloaked interceptor that periodically blinks out of visibility before executing a high-speed lethal dash toward the player.
6. **Apex Core (Wave 10 Boss):** Massive multi-phase dreadnought with rotating laser barriers, high armor, and minion spawn capabilities.

---

## 5. Wave & Upgrade Systems
- **Progression:** 10 distinct waves with scripted enemy composition scaling in count, speed, and aggression.
- **Upgrade Between Waves:** After clearing waves 1 through 9, action pauses and an upgrade overlay presents 3 random cards. The player picks 1:
  - *Quantum Overclock:* +25% Fire Rate.
  - *Prism Array:* +1 Spread Shot (fires dual/triple projectiles).
  - *Aegis Barrier:* Adds an energy shield absorbing one heavy hit (recharges slowly).
  - *Grav-Magnet:* Increases energy pickup attraction radius by 50%.
  - *Thruster Surge:* +20% Movement Speed.
  - *Core Vitality:* Restores full health and increases Max HP by +25.

---

## 6. Scoring, Combo, and Lives
- **Score:** Awarded per enemy destroyed (Glowite: 100, Vexar: 150, Split-Node: 200, Goliath-X: 400, Phantasm: 250, Boss: 2000).
- **Combo System:** Continuous kills within a 3-second window build a combo multiplier (up to 8x) that multiplies score gains.
- **Health System:** Single health pool (100 HP max) displayed via a prominent HUD bar with visual flashing and audio warnings on low health.

---

## 7. UI & Screens
1. **Title Screen:** Pulsing neon logotype (*SYNTH SURGE: OMEGA*), High Score display, "CLICK or ENTER TO START", and audio mute toggle.
2. **Play HUD:** Top-right/left indicators showing current Wave number, Score, Combo multiplier, Health bar, and active upgrade icons.
3. **Upgrade Screen:** Semi-transparent cybernetic overlay presenting 3 distinct selectable upgrade cards with glowing borders and descriptions.
4. **Pause Menu:** Modal overlay with "GAME PAUSED", Resume, Restart, Mute Toggle, and Quit to Title options.
5. **Game Over / Victory Screen:** Final run statistics (Waves survived, Final Score, Enemies defeated, Accuracy), banner ("GAME OVER" or "VICTORY"), and "PRESS R TO RESTART".

---

## 8. Visual Direction & Palette
- **Aesthetic:** Cybernetic vector arcade meets synthwave minimalism with bloom and glow effects.
- **Color Palette (4 Neon Colors):**
  - Background: Deep Obsidian Void (`#060812`) with a subtle cyan perspective grid (`#0e1628`).
  - Player/Core: Neon Cyan (`#00f0ff`) with pure white highlight.
  - Enemies/Danger: Neon Magenta (`#ff007f`) and Amber Flame (`#ffb703`).
  - Upgrades/Items: Neon Emerald (`#00f5d4`).
- **Polish:** Screen shake on impacts, floating damage/score text numbers, additive blending (`ctx.globalCompositeOperation = 'lighter'`), and particle explosion bursts.

---

## 9. Audio Plan (Synthesized WebAudio)
- **Engine:** Pure procedural WebAudio API synthesizer (`audio.js`), zero external audio files.
- **Sound Effects:**
  - *Shoot:* Short frequency sweep (sawtooth/square wave).
  - *Enemy Hit:* Short white-noise burst + low thump.
  - *Explosion:* Decaying low-pass filtered noise buffer.
  - *Pickup:* Ascending 3-note synth arpeggio chime.
  - *Wave Start / Upgrade:* Harmonious chord sweep.
- **Music:** Procedural ambient synthwave background bassline and atmospheric pad loop.
- **Controls:** Global mute toggle button.

---

## 10. File Structure Plan (`game/`)
Targeting 13 modular files under `game/`:
- `game/index.html` - HTML entry point with canvas and viewport meta.
- `game/src/config.js` - Global constants, dimensions, color palette, and tuning values.
- `game/src/random.js` - Seeded PRNG (Mulberry32) for deterministic gameplay and screenshots.
- `game/src/input.js` - Keyboard and mouse event listeners and state management.
- `game/src/audio.js` - WebAudio sound effects synthesizer and music loop manager.
- `game/src/player.js` - Player physics, movement, weapon firing, collisions, and upgrades.
- `game/src/enemies.js` - Enemy definitions (5 types + boss), AI behaviors, and spawn logic.
- `game/src/projectiles.js` - Projectiles, lasers, and particle management system.
- `game/src/world.js` - Arena grid, boundary checks, and energy pickup drops.
- `game/src/waves.js` - Wave manager, enemy spawning pacer, and upgrade card generator.
- `game/src/ui.js` - Screen renderers (Title, HUD, Pause, Upgrade, Game Over).
- `game/src/render.js` - Main rendering pipeline, camera shake, and post-processing glow.
- `game/src/shots.js` - Deterministic screenshot staging parser (`?shot=` query & autopilot).
- `game/src/main.js` - Application lifecycle, state machine, and main game loop.

---

## 11. Screenshot Scenes & Deterministic Staging
`shots.json` maps 4 required screenshots:
1. `1-start.jpg` (`?shot=start&seed=1001`) - Title screen with logo, high score, and menu prompts.
2. `2-play.jpg` (`?shot=play&seed=1001`) - Early wave gameplay showing player, initial enemies, and HUD.
3. `3-action.jpg` (`?shot=action&seed=1001`) - Intense combat with heavy particle effects, multiple enemies, projectiles, and floating score numbers.
4. `4-end.jpg` (`?shot=end&seed=1001`) - Game Over screen showing run statistics and restart prompt.

**Staging Mechanism (`shots.js`):**
When the URL contains `?shot=<scene>&seed=<n>`, the game initializes the seeded PRNG, simulates or sets up the requested scene state instantly (or via deterministic autopilot tick steps), renders the final frame, and sets `window.__shotReady = true`.

---

## 12. Locked Decisions Summary
- **Genre & Theme:** Neon arena wave-survival shooter with cybernetic vector art.
- **Enemies:** 5 distinct types (Glowite, Vexar, Split-Node, Goliath-X, Phantasm) plus Apex Core boss.
- **Progression:** 10 waves with 3-card tactical draft upgrades between waves.
- **Audio:** 100% synthesized WebAudio sound effects and ambient music loop.
- **Tech Stack:** Vanilla JavaScript ES modules under `game/src/`, no build step, no external libraries.
- **Deliverable:** Fully specified in `GAME_DESIGN.md` ready for implementation across sessions 2-5.
