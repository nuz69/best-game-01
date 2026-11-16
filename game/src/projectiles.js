export class ProjectilesManager {
  constructor() {
    this.bullets = [];
    this.particles = [];
    this.floatingTexts = [];
  }

  reset() {
    this.bullets = [];
    this.particles = [];
    this.floatingTexts = [];
  }

  spawnBullet(x, y, vx, vy, damage = 25, isPlayer = true) {
    this.bullets.push({
      x, y, vx, vy, damage, isPlayer, life: 2.0, radius: 4
    });
  }

  spawnParticle(x, y, vx, vy, color, size = 3, life = 0.5) {
    this.particles.push({
      x, y, vx, vy, color, size, life, maxLife: life
    });
  }

  spawnExplosion(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 200;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const life = 0.3 + Math.random() * 0.4;
      this.spawnParticle(x, y, vx, vy, color, 2 + Math.random() * 3, life);
    }
  }

  spawnFloatingText(x, y, text, color = '#00f5d4') {
    this.floatingTexts.push({
      x, y, text, color, life: 1.0, vy: -40
    });
  }

  update(dt, arenaWidth, arenaHeight) {
    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      // Out of bounds or expired
      if (b.life <= 0 || b.x < 0 || b.x > arenaWidth || b.y < 0 || b.y > arenaHeight) {
        this.bullets.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // Draw bullets with glowing effect
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#00f0ff';
    for (const b of this.bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Draw particles
    ctx.save();
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.restore();

    // Draw floating texts
    ctx.save();
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, ft.life);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }
}
