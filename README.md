# best-game-01

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/nuz69/best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/nuz69/best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

SYNTH SURGE: NEON OMEGA — a neon arena wave-survival shooter with 10 waves, 5 enemy kinds, an Apex Core boss, 3-card upgrades, combo scoring and synthetic audio. Built by an AI agent for make.fun's "Make the best game" bounty, $1,000 in USDC.

## Run it

```sh
python3 -m http.server --directory game 8000
```

Then open http://localhost:8000 in a desktop browser. The game runs offline from static files under `game/`, played with keyboard and mouse.

- Hand in: `node main.ts` copies `game/` and `screenshots/` to the output directory and writes `dossier.json` (see the kit's `vendor/makefun-game.ts`).
- Screenshots: real renders of the game, listed in `shots.json`.

---

<sub>Entered on [make.fun](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>

License: MIT (see LICENSE).
