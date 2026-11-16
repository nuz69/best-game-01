import { CONFIG } from './config.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = CONFIG.PLAYER.radius;
    this.angle = 0;
    this.health = CONFIG.PLAYER.maxHealth;
    this.maxHealth = CONFIG.PLAYER.maxHealth;
    this.hitFlashTimer = 0;
    this.invulnerableTimer = 0;
    this.fireCooldown = 0;

    // Upgrades state
    this.upgrades = {
      fireRate: 1, // multiplier
      spread: 0,   // additional bullets (0 = single, 1 = dual, etc.)
      shield: false,
      magnet: 1,
      speed: 1,    // multiplier
      maxHealth: CONFIG.PLAYER.maxHealth
    };
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.health = this.maxHealth;
    this.hitFlashTimer = 0;
    this.invulnerableTimer = 0;
    this.fireCooldown = 0;
  }

  update(dt, input, arenaWidth, arenaHeight) {
    // Movement acceleration & friction
    const mx = input.moveX;
    const my = input.moveY;
    const accel = CONFIG.PLAYER.acceleration * this.upgrades.speed;
    const maxSpeed = CONFIG.PLAYER.maxSpeed * this.upgrades.speed;

    if (mx !== 0 || my !== 0) {
      const len = Math.hypot(mx, my);
      const nx = mx / len;
      const ny = my / len;
      this.vx += nx * accel * dt;
      this.vy += ny * accel * dt;
    }

    // Friction damping
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > 0) {
      const drop = speed * CONFIG.PLAYER.friction * dt;
      const newSpeed = Math.max(0, speed - drop);
      this.vx = (this.vx / speed) * newSpeed;
      this.vy = (this.vy / speed) * newSpeed;
    }

    // Cap max speed
    const currentSpeed = Math.hypot(this.vx, this.vy);
    if (currentSpeed > maxSpeed) {
      this.vx = (this.vx / currentSpeed) * maxSpeed;
      this.vy = (this.vy / currentSpeed) * maxSpeed;
    }

    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Clamp to arena bounds with margin
    const margin = this.radius + 10;
    this.x = Math.max(margin, Math.min(arenaWidth - margin, this.x));
    this.y = Math.max(margin, Math.min(arenaHeight - margin, this.y));

    // Aim towards mouse world position
    const dx = input.mouse.worldX - this.x;
    const dy = input.mouse.worldY - this.y;
    this.angle = Math.atan2(dy, dx);

    // Timers
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // Fire cooldown
    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt;
    }
  }

  canFire() {
    return this.fireCooldown <= 0;
  }

  resetFireCooldown() {
    const rate = CONFIG.PLAYER.baseFireRate * this.upgrades.fireRate;
    this.fireCooldown = 1 / rate;
  }

  takeDamage(amount) {
    if (this.invulnerableTimer > 0) return;

    if (this.upgrades.shield) {
      this.upgrades.shield = false; // Shield absorbs the hit
      this.hitFlashTimer = 0.5;
      this.invulnerableTimer = 1.0;
      return;
    }

    this.health = Math.max(0, this.health - amount);
    this.hitFlashTimer = 0.5;
    this.invulnerableTimer = 1.0; // 1.0 second post-hit invulnerability window
  }
}
