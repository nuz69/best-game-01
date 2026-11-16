import { CONFIG } from './config.js';
import { Player } from './player.js';
import { ProjectilesManager } from './projectiles.js';
import { createRNG } from './random.js';

export class World {
  constructor() {
    this.width = CONFIG.ARENA_WIDTH;
    this.height = CONFIG.ARENA_HEIGHT;
    this.player = new Player(this.width / 2, this.height / 2);
    this.projectiles = new ProjectilesManager();
    this.enemies = [];
    this.pickups = [];
    this.score = 0;
    this.wave = 1;
    this.combo = 1;
    this.comboTimer = 0;
    this.rng = createRNG(12345);
  }

  reset(seed = 12345) {
    this.rng = createRNG(seed);
    this.width = CONFIG.ARENA_WIDTH;
    this.height = CONFIG.ARENA_HEIGHT;
    this.player.reset(this.width / 2, this.height / 2);
    this.projectiles.reset();
    this.enemies = [];
    this.pickups = [];
    this.score = 0;
    this.wave = 1;
    this.combo = 1;
    this.comboTimer = 0;
  }

  step(dt, input) {
    // Update player
    this.player.update(dt, input, this.width, this.height);

    // Handle player firing
    if (input.isFiring && this.player.canFire()) {
      this.player.resetFireCooldown();
      const speed = CONFIG.PLAYER.bulletSpeed;
      const angle = this.player.angle;
      const spread = this.player.upgrades.spread;

      // Primary bullet
      const vx = Math.cos(angle) * speed + this.player.vx * 0.3;
      const vy = Math.sin(angle) * speed + this.player.vy * 0.3;
      const noseX = this.player.x + Math.cos(angle) * 18;
      const noseY = this.player.y + Math.sin(angle) * 18;
      this.projectiles.spawnBullet(noseX, noseY, vx, vy, 25, true);

      // Additional spread shots if upgraded
      if (spread > 0) {
        for (let i = 1; i <= spread; i++) {
          const offsetAngle1 = angle + i * 0.15;
          const vx1 = Math.cos(offsetAngle1) * speed + this.player.vx * 0.3;
          const vy1 = Math.sin(offsetAngle1) * speed + this.player.vy * 0.3;
          this.projectiles.spawnBullet(noseX, noseY, vx1, vy1, 20, true);

          const offsetAngle2 = angle - i * 0.15;
          const vx2 = Math.cos(offsetAngle2) * speed + this.player.vx * 0.3;
          const vy2 = Math.sin(offsetAngle2) * speed + this.player.vy * 0.3;
          this.projectiles.spawnBullet(noseX, noseY, vx2, vy2, 20, true);
        }
      }
    }

    // Update projectiles & particles
    this.projectiles.update(dt, this.width, this.height);

    // Update combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }
  }

  addScore(points) {
    const earned = points * this.combo;
    this.score += earned;
    this.combo = Math.min(CONFIG.COMBO.maxMultiplier, this.combo + 1);
    this.comboTimer = CONFIG.COMBO.windowDuration;
    return earned;
  }
}
