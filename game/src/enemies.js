import { CONFIG } from './config.js';

export class Enemy {
  constructor(x, y, type = 'glowite') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.vx = 0;
    this.vy = 0;
    this.attackTimer = 0;
    this.stateTimer = 0;
    this.angle = 0;

    // Set stats based on type
    switch (type) {
      case 'glowite':
        this.radius = 12;
        this.health = 30;
        this.maxHealth = 30;
        this.speed = 260;
        this.scoreValue = CONFIG.SCORES.glowite;
        this.color = CONFIG.COLORS.enemyMagenta;
        break;
      case 'vexar':
        this.radius = 14;
        this.health = 50;
        this.maxHealth = 50;
        this.speed = 170;
        this.scoreValue = CONFIG.SCORES.vexar;
        this.color = CONFIG.COLORS.enemyAmber;
        this.fireCooldown = 1.5;
        break;
      case 'splitNode':
        this.radius = 18;
        this.health = 80;
        this.maxHealth = 80;
        this.speed = 130;
        this.scoreValue = CONFIG.SCORES.splitNode;
        this.color = '#9d4edd'; // Neon Purple
        break;
      case 'fragment':
        this.radius = 8;
        this.health = 15;
        this.maxHealth = 15;
        this.speed = 320;
        this.scoreValue = 50;
        this.color = '#c77dff';
        break;
      case 'goliathX':
        this.radius = 26;
        this.health = 350;
        this.maxHealth = 350;
        this.speed = 85;
        this.scoreValue = CONFIG.SCORES.goliathX;
        this.color = '#f72585';
        break;
      case 'phantasm':
        this.radius = 14;
        this.health = 45;
        this.maxHealth = 45;
        this.speed = 220;
        this.scoreValue = CONFIG.SCORES.phantasm;
        this.color = '#4cc9f0';
        this.isCloaked = false;
        this.dashTimer = 2.0;
        break;
      case 'boss':
        this.radius = 45;
        this.health = 3000;
        this.maxHealth = 3000;
        this.speed = 70;
        this.scoreValue = CONFIG.SCORES.boss;
        this.color = '#ff007f';
        this.bossPhase = 1;
        this.attackPatternTimer = 0;
        this.minionSpawnTimer = 0;
        break;
      default:
        this.radius = 12;
        this.health = 30;
        this.maxHealth = 30;
        this.speed = 200;
        this.scoreValue = 100;
        this.color = CONFIG.COLORS.enemyMagenta;
    }
  }

  update(dt, player, world) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    this.angle = Math.atan2(dy, dx);

    switch (this.type) {
      case 'glowite':
      case 'fragment':
        // Direct chaser
        this.vx = nx * this.speed;
        this.vy = ny * this.speed;
        break;

      case 'vexar':
        // Ranged shooter: maintains distance around 320px
        if (dist > 360) {
          this.vx = nx * this.speed;
          this.vy = ny * this.speed;
        } else if (dist < 260) {
          this.vx = -nx * this.speed;
          this.vy = -ny * this.speed;
        } else {
          // Circle around player
          this.vx = -ny * this.speed * 0.8;
          this.vy = nx * this.speed * 0.8;
        }

        this.fireCooldown -= dt;
        if (this.fireCooldown <= 0) {
          this.fireCooldown = 1.8 + Math.random() * 0.5;
          const bulletSpeed = 450;
          world.projectiles.spawnBullet(this.x, this.y, nx * bulletSpeed, ny * bulletSpeed, 15, false);
        }
        break;

      case 'splitNode':
        // Slow advance
        this.vx = nx * this.speed;
        this.vy = ny * this.speed;
        break;

      case 'goliathX':
        // Slow relentless brute
        this.vx = nx * this.speed;
        this.vy = ny * this.speed;
        break;

      case 'phantasm':
        // Cloak and dash
        this.stateTimer += dt;
        if (this.stateTimer > 3.0) {
          this.isCloaked = !this.isCloaked;
          this.stateTimer = 0;
          if (!this.isCloaked) {
            // Dash towards player prediction
            const dashSpeed = 600;
            this.vx = nx * dashSpeed;
            this.vy = ny * dashSpeed;
            break;
          }
        }

        if (this.isCloaked) {
          this.vx = nx * (this.speed * 0.5);
          this.vy = ny * (this.speed * 0.5);
        } else {
          this.vx = nx * this.speed;
          this.vy = ny * this.speed;
        }
        break;

      case 'boss':
        // Boss Apex Core behavior
        this.attackPatternTimer += dt;
        this.minionSpawnTimer += dt;

        // Move towards center or hover near player
        const targetX = world.width / 2 + Math.sin(Date.now() * 0.001) * 300;
        const targetY = world.height / 2 + Math.cos(Date.now() * 0.0008) * 300;
        const bdx = targetX - this.x;
        const bdy = targetY - this.y;
        this.vx = (bdx / (Math.hypot(bdx, bdy) || 1)) * this.speed;
        this.vy = (bdy / (Math.hypot(bdx, bdy) || 1)) * this.speed;

        // Radial bullet attack every 1.5s
        if (this.attackPatternTimer >= 1.5) {
          this.attackPatternTimer = 0;
          const count = 10;
          const speed = 380;
          const baseAngle = Date.now() * 0.002;
          for (let i = 0; i < count; i++) {
            const a = baseAngle + (i * Math.PI * 2) / count;
            world.projectiles.spawnBullet(
              this.x,
              this.y,
              Math.cos(a) * speed,
              Math.sin(a) * speed,
              20,
              false
            );
          }
        }

        // Minion spawn every 8 seconds
        if (this.minionSpawnTimer >= 8.0) {
          this.minionSpawnTimer = 0;
          world.spawnMinion(this.x + 50, this.y);
          world.spawnMinion(this.x - 50, this.y);
        }
        break;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.fillStyle = '#060812';
    ctx.lineWidth = 2;

    if (this.isCloaked) {
      ctx.globalAlpha = 0.25;
    }

    switch (this.type) {
      case 'glowite':
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius, -this.radius * 0.8);
        ctx.lineTo(-this.radius * 0.5, 0);
        ctx.lineTo(-this.radius, this.radius * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'vexar':
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = CONFIG.COLORS.textWhite;
        ctx.fillRect(-3, -3, 6, 6);
        break;

      case 'splitNode':
        ctx.rotate(Date.now() * 0.003);
        ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'fragment':
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius, -this.radius);
        ctx.lineTo(-this.radius, this.radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'goliathX':
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const px = Math.cos(a) * this.radius;
          const py = Math.sin(a) * this.radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'phantasm':
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(this.radius * 1.2, 0);
        ctx.lineTo(-this.radius, -this.radius);
        ctx.lineTo(-this.radius * 0.5, 0);
        ctx.lineTo(-this.radius, this.radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'boss':
        ctx.rotate(Date.now() * 0.001);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        // Core glowing center
        ctx.fillStyle = CONFIG.COLORS.textWhite;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }
}
