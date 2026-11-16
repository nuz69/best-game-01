import { Enemy } from './enemies.js';

export function handleShotMode(app) {
  const params = new URLSearchParams(window.location.search);
  const shotScene = params.get('shot');
  const seedStr = params.get('seed');
  const seed = seedStr ? parseInt(seedStr, 10) : 1001;

  if (!shotScene) return false;

  window.__shotMode = true;
  app.world.reset(seed);

  if (shotScene === 'start') {
    app.state = 'title';
    app.world.waveManager.startWave(1);
    for (let i = 0; i < 20; i++) {
      app.world.step(0.016, { moveX: 0, moveY: 0, isFiring: false, mouse: { worldX: app.world.player.x + 100, worldY: app.world.player.y } });
    }
  } else if (shotScene === 'play') {
    app.state = 'play';
    app.world.waveManager.startWave(3);
    for (let i = 0; i < 45; i++) {
      runAutopilotStep(app.world, 0.016);
    }
  } else if (shotScene === 'action') {
    app.state = 'play';
    app.world.waveManager.startWave(7);
    // Add multiple enemies and explosions
    for (let i = 0; i < 12; i++) {
      const type = i % 3 === 0 ? 'phantasm' : (i % 3 === 1 ? 'splitNode' : 'vexar');
      app.world.enemies.push(new Enemy(app.world.width / 2 + (i - 6) * 60, app.world.height / 2 + (i % 4) * 50, type));
    }
    app.world.projectiles.spawnFloatingText(app.world.player.x, app.world.player.y - 60, '+1600 COMBO x8!', '#ffb703');
    for (let i = 0; i < 30; i++) {
      runAutopilotStep(app.world, 0.016);
    }
  } else if (shotScene === 'end') {
    app.state = 'over';
    app.world.score = 48500;
    app.world.waveManager.currentWave = 8;
  }

  app.renderer.updateCamera(app.world.player.x, app.world.player.y);
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

  const inputMock = {
    moveX: nearest ? (nearest.x > player.x ? -0.4 : 0.4) : 0,
    moveY: nearest ? (nearest.y > player.y ? -0.4 : 0.4) : 0,
    isFiring: true,
    mouse: {
      worldX: nearest ? nearest.x : player.x + 200,
      worldY: nearest ? nearest.y : player.y
    }
  };
  world.step(dt, inputMock);
}
