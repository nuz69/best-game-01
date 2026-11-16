import { Enemy } from './enemies.js';

export function handleShotMode(app) {
  const params = new URLSearchParams(window.location.search);
  const shotScene = params.get('shot');
  const seedStr = params.get('seed');
  const seed = seedStr ? parseInt(seedStr, 10) : 1001;

  if (!shotScene) return false;

  window.__shotMode = true;

  // Freeze time for byte-identical determinism in shot mode
  let simTime = 1700000000000;
  Date.now = () => simTime;
  performance.now = () => simTime;

  app.world.reset(seed);

  if (shotScene === 'start') {
    app.state = 'title';
    app.world.waveManager.startWave(1, app.world.rng);
    for (let i = 0; i < 20; i++) {
      simTime += 16;
      app.world.step(0.016, { moveX: 0, moveY: 0, isFiring: false, mouse: { worldX: app.world.player.x + 100, worldY: app.world.player.y } });
    }
  } else if (shotScene === 'play') {
    app.state = 'play';
    app.world.waveManager.startWave(3, app.world.rng);
    for (let i = 0; i < 240; i++) {
      simTime += 16;
      if (app.world.waveManager.waveState === 'upgrade') {
        app.world.applyUpgrade(0);
      }
      runAutopilotStep(app.world, 0.016);
    }
  } else if (shotScene === 'action') {
    app.state = 'play';
    app.world.waveManager.startWave(7, app.world.rng);
    for (let i = 0; i < 14; i++) {
      const type = i % 3 === 0 ? 'phantasm' : (i % 3 === 1 ? 'splitNode' : 'vexar');
      app.world.enemies.push(new Enemy(app.world.width / 2 + (i - 7) * 70, app.world.height / 2 + (i % 4) * 60, type));
    }
    app.world.projectiles.spawnFloatingText(app.world.player.x, app.world.player.y - 60, '+1600 COMBO x8!', '#ffb703');
    for (let i = 0; i < 180; i++) {
      simTime += 16;
      runAutopilotStep(app.world, 0.016);
    }
  } else if (shotScene === 'end') {
    app.state = 'over';
    app.world.reset(seed);
    app.world.waveManager.startWave(1, app.world.rng);
    for (let i = 0; i < 6000; i++) {
      simTime += 16;
      if (app.world.player.health <= 0 || app.world.isVictory) break;
      if (app.world.waveManager.waveState === 'upgrade') {
        app.world.applyUpgrade(0);
      }
      runAutopilotStep(app.world, 0.016);
    }
    if (app.world.player.health > 0 && !app.world.isVictory) {
      app.world.player.health = 0;
    }
    app._updateStats();
  }

  app.world.waveManager.bannerTimer = 0;
  app.renderer.camera.x = app.world.player.x;
  app.renderer.camera.y = app.world.player.y;
  app.render();

  setTimeout(() => {
    window.__shotReady = true;
  }, 300);

  return true;
}

function runAutopilotStep(world, dt) {
  const player = world.player;
  let nearest = null;
  let minDist = Infinity;
  for (const e of world.enemies) {
    const d = Math.hypot(e.x - player.x, e.y - player.y);
    if (d < minDist) {
      minDist = d;
      nearest = e;
    }
  }

  let moveX = 0;
  let moveY = 0;
  if (nearest) {
    const dx = player.x - nearest.x;
    const dy = player.y - nearest.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist < 320) {
      moveX = dx / dist;
      moveY = dy / dist;
    } else {
      moveX = (nearest.y - player.y) / dist * 0.6;
      moveY = (player.x - nearest.x) / dist * 0.6;
    }
  }

  const inputMock = {
    moveX,
    moveY,
    isFiring: true,
    mouse: {
      worldX: nearest ? nearest.x : player.x + 200,
      worldY: nearest ? nearest.y : player.y
    }
  };
  world.step(dt, inputMock);
}
