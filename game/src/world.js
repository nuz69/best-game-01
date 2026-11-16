import { CONFIG } from './config.js';
import { Player } from './player.js';
import { ProjectilesManager } from './projectiles.js';
import { WaveManager, UPGRADE_CARDS } from './waves.js';
import { Enemy } from './enemies.js';
import { createRNG } from './random.js';
import { audio } from './audio.js';

export class World {
  constructor() {
    this.width = CONFIG.ARENA_WIDTH;
    this.height = CONFIG.ARENA_HEIGHT;
    this.player = new Player(this.width / 2, this.height / 2);
    this.projectiles = new ProjectilesManager();
    this.waveManager = new WaveManager();
    this.enemies = [];
    this.pickups = [];
    this.upgradeCards = [];
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.isVictory = false;
    this.rng = createRNG(12345);
    this.kills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
  }

  get wave() {
    return this.waveManager.currentWave;
  }

  reset(seed = 12345) {
    this.rng = createRNG(seed);
    this.width = CONFIG.ARENA_WIDTH;
    this.height = CONFIG.ARENA_HEIGHT;
    this.player.reset(this.width / 2, this.height / 2);
    this.projectiles.reset();
    this.waveManager.reset(this.rng);
    this.enemies = [];
    this.pickups = [];
    this.upgradeCards = [];
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.isVictory = false;
    this.kills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
  }

  spawnMinion(x, y) {
    this.enemies.push(new Enemy(x, y, this.rng() > 0.5 ? 'glowite' : 'vexar'));
  }

  step(dt, input) {
    if (this.isVictory || this.waveManager.waveState === 'upgrade') return;

    // Update player
    this.player.update(dt, input, this.width, this.height);

    // Handle player firing
    if (input.isFiring && this.player.canFire()) {
      this.player.resetFireCooldown();
      audio.shoot();
      const speed = CONFIG.PLAYER.bulletSpeed;
      const angle = this.player.angle;
      const spread = this.player.upgrades.spread;

      const vx = Math.cos(angle) * speed + this.player.vx * 0.3;
      const vy = Math.sin(angle) * speed + this.player.vy * 0.3;
      const noseX = this.player.x + Math.cos(angle) * 18;
      const noseY = this.player.y + Math.sin(angle) * 18;
      this.projectiles.spawnBullet(noseX, noseY, vx, vy, 25, true);
      this.shotsFired++;

      if (spread > 0) {
        for (let i = 1; i <= spread; i++) {
          const offsetAngle1 = angle + i * 0.15;
          const vx1 = Math.cos(offsetAngle1) * speed + this.player.vx * 0.3;
          const vy1 = Math.sin(offsetAngle1) * speed + this.player.vy * 0.3;
          this.projectiles.spawnBullet(noseX, noseY, vx1, vy1, 20, true);
          this.shotsFired++;

          const offsetAngle2 = angle - i * 0.15;
          const vx2 = Math.cos(offsetAngle2) * speed + this.player.vx * 0.3;
          const vy2 = Math.sin(offsetAngle2) * speed + this.player.vy * 0.3;
          this.projectiles.spawnBullet(noseX, noseY, vx2, vy2, 20, true);
          this.shotsFired++;
        }
      }
    }

    // Update wave manager
    this.waveManager.update(dt, this);

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(dt, this.player, this);
    }

    // Update projectiles & particles
    this.projectiles.update(dt, this.width, this.height);

    // Update pickups
    const magnetRadius = 140 * this.player.upgrades.magnet;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      const pdx = this.player.x - p.x;
      const pdy = this.player.y - p.y;
      const pdist = Math.hypot(pdx, pdy);

      if (pdist < magnetRadius) {
        const pullSpeed = 400;
        p.x += (pdx / pdist) * pullSpeed * dt;
        p.y += (pdy / pdist) * pullSpeed * dt;
      }

      if (pdist < this.player.radius + p.radius) {
        this.addScore(p.value);
        audio.pickup();
        this.projectiles.spawnFloatingText(p.x, p.y, `+${p.value} ENERGY`, CONFIG.COLORS.pickupEmerald);
        this.pickups.splice(i, 1);
      }
    }

    // 1. Player bullets vs Enemies
    for (let i = this.projectiles.bullets.length - 1; i >= 0; i--) {
      const b = this.projectiles.bullets[i];
      if (!b.isPlayer) continue;

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        const dist = Math.hypot(b.x - e.x, b.y - e.y);

        if (dist < b.radius + e.radius) {
          e.health -= b.damage;
          this.shotsHit++;
          audio.enemyHit();
          this.projectiles.spawnParticle(b.x, b.y, (this.rng() - 0.5) * 100, (this.rng() - 0.5) * 100, CONFIG.COLORS.bullet, 2, 0.3);
          this.projectiles.bullets.splice(i, 1);

          if (e.health <= 0) {
            this.kills++;
            const earned = this.addScore(e.scoreValue);
            audio.explosion();
            this.projectiles.spawnExplosion(e.x, e.y, e.color, e.type === 'boss' ? 30 : 12, this.rng);
            this.projectiles.spawnFloatingText(e.x, e.y, `+${earned}`, CONFIG.COLORS.enemyAmber);

            this.pickups.push({
              x: e.x,
              y: e.y,
              radius: 8,
              value: Math.floor(e.scoreValue / 2)
            });

            if (e.type === 'splitNode') {
              this.enemies.push(new Enemy(e.x + 15, e.y, 'fragment'));
              this.enemies.push(new Enemy(e.x - 15, e.y, 'fragment'));
            }

            if (e.type === 'boss') {
              this.isVictory = true;
            }

            this.enemies.splice(j, 1);
          }
          break;
        }
      }
    }

    // 2. Enemy bullets vs Player
    for (let i = this.projectiles.bullets.length - 1; i >= 0; i--) {
      const b = this.projectiles.bullets[i];
      if (b.isPlayer) continue;

      const dist = Math.hypot(b.x - this.player.x, b.y - this.player.y);
      if (dist < b.radius + this.player.radius) {
        this.player.takeDamage(b.damage);
        audio.enemyHit();
        this.projectiles.spawnExplosion(b.x, b.y, CONFIG.COLORS.enemyMagenta, 8, this.rng);
        this.projectiles.spawnFloatingText(this.player.x, this.player.y, `-${b.damage}`, CONFIG.COLORS.enemyMagenta);
        this.projectiles.bullets.splice(i, 1);
      }
    }

    // 3. Enemies vs Player contact damage
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const dist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
      if (dist < e.radius + this.player.radius) {
        const contactDamage = e.type === 'boss' ? 30 : (e.type === 'goliathX' ? 20 : 10);
        this.player.takeDamage(contactDamage);
        if (this.player.invulnerableTimer > 0 || this.player.health <= 0) {
          audio.enemyHit();
        }
        this.projectiles.spawnExplosion(this.player.x, this.player.y, CONFIG.COLORS.enemyMagenta, 10, this.rng);
        this.projectiles.spawnFloatingText(this.player.x, this.player.y, `-${contactDamage}`, CONFIG.COLORS.enemyMagenta);

        const overlap = (e.radius + this.player.radius + 2) - dist;
        const nx = (e.x - this.player.x) / (dist || 1);
        const ny = (e.y - this.player.y) / (dist || 1);
        e.x += nx * overlap;
        e.y += ny * overlap;
        this.player.vx -= nx * 150;
        this.player.vy -= ny * 150;
      }
    }

    // Wave clear detection -> Trigger upgrade state
    if (this.waveManager.spawnQueue.length === 0 && this.enemies.length === 0 && !this.isVictory && this.waveManager.waveState === 'spawning') {
      if (this.wave < this.waveManager.maxWaves) {
        this.waveManager.waveState = 'upgrade';
        this.upgradeCards = this.waveManager.generateRandomUpgradeCards(3, this.rng);
      }
    }

    // Update combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }
  }

  applyUpgrade(index) {
    if (this.upgradeCards[index]) {
      this.upgradeCards[index].apply(this.player);
      audio.upgrade();
      this.projectiles.spawnFloatingText(this.player.x, this.player.y - 40, `UPGRADE: ${this.upgradeCards[index].title}`, CONFIG.COLORS.pickupEmerald);
      this.upgradeCards = [];
      this.waveManager.startWave(this.wave + 1, this.rng);
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
