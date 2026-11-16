import { CONFIG } from './config.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = { x: 0, y: 0, zoom: 1 };
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  updateCamera(targetX, targetY) {
    // Smooth follow camera
    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.y += (targetY - this.camera.y) * 0.1;
  }

  clear() {
    this.ctx.fillStyle = CONFIG.COLORS.bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderWorld(world) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    // Center camera on player
    ctx.translate(width / 2, height / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Draw arena grid & boundary
    this._drawGrid(world);

    // 2. Draw pickups
    this._drawPickups(world.pickups);

    // 3. Draw enemies
    for (const enemy of world.enemies) {
      enemy.draw(ctx);
    }

    // 4. Draw projectiles & particles
    world.projectiles.draw(ctx);

    // 5. Draw player vessel with neon glow
    this._drawPlayer(world.player);

    ctx.restore();

    // 6. Draw HUD overlays, Boss bar, Wave banner
    this._drawHUD(world);
  }

  _drawGrid(world) {
    const ctx = this.ctx;
    const gridSize = 100;

    // Arena boundary box
    ctx.strokeStyle = CONFIG.COLORS.enemyMagenta;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, world.width, world.height);

    // Grid lines
    ctx.strokeStyle = CONFIG.COLORS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= world.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, world.height);
    }
    for (let y = 0; y <= world.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(world.width, y);
    }
    ctx.stroke();
  }

  _drawPickups(pickups) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = 12;
    ctx.shadowColor = CONFIG.COLORS.pickupEmerald;
    ctx.fillStyle = CONFIG.COLORS.pickupEmerald;

    for (const p of pickups) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawPlayer(player) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Neon glow effect using additive blending
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = player.hitFlashTimer > 0 ? 30 : 15;
    ctx.shadowColor = player.hitFlashTimer > 0 ? '#ff007f' : CONFIG.COLORS.playerGlow;

    // Player ship shape (sleek vector triangle)
    ctx.strokeStyle = player.hitFlashTimer > 0 ? '#ff007f' : CONFIG.COLORS.player;
    ctx.fillStyle = '#060812';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-14, -12);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-14, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shield ring if active
    if (player.upgrades.shield) {
      ctx.strokeStyle = CONFIG.COLORS.pickupEmerald;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawHUD(world) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.font = 'bold 16px "Courier New", monospace';

    // Top-left: Wave & Score
    ctx.fillStyle = CONFIG.COLORS.player;
    ctx.fillText(`WAVE: ${world.wave} / 10`, 24, 36);
    ctx.fillText(`SCORE: ${world.score}`, 24, 64);

    if (world.combo > 1) {
      ctx.fillStyle = CONFIG.COLORS.enemyAmber;
      ctx.fillText(`COMBO: ${world.combo}x`, 24, 92);
    }

    // Top-right: Health bar
    const barWidth = 200;
    const barHeight = 20;
    const barX = width - barWidth - 24;
    const barY = 24;

    ctx.fillStyle = CONFIG.COLORS.hudBg;
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthRatio = Math.max(0, world.player.health / world.player.maxHealth);
    ctx.fillStyle = healthRatio > 0.3 ? CONFIG.COLORS.player : CONFIG.COLORS.enemyMagenta;
    ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

    ctx.strokeStyle = CONFIG.COLORS.player;
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = CONFIG.COLORS.textWhite;
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`HP: ${Math.ceil(world.player.health)}/${world.player.maxHealth}`, barX + barWidth / 2, barY + 15);

    // Boss Health Bar if boss is present
    const boss = world.enemies.find(e => e.type === 'boss');
    if (boss) {
      const bossBarWidth = Math.min(500, width - 100);
      const bossBarHeight = 16;
      const bossBarX = (width - bossBarWidth) / 2;
      const bossBarY = 70;

      ctx.fillStyle = CONFIG.COLORS.hudBg;
      ctx.fillRect(bossBarX, bossBarY, bossBarWidth, bossBarHeight);

      const bossRatio = Math.max(0, boss.health / boss.maxHealth);
      ctx.fillStyle = CONFIG.COLORS.enemyMagenta;
      ctx.fillRect(bossBarX, bossBarY, bossBarWidth * bossRatio, bossBarHeight);

      ctx.strokeStyle = CONFIG.COLORS.enemyAmber;
      ctx.lineWidth = 2;
      ctx.strokeRect(bossBarX, bossBarY, bossBarWidth, bossBarHeight);

      ctx.fillStyle = CONFIG.COLORS.textWhite;
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`APEX CORE HP: ${Math.ceil(boss.health)} / ${boss.maxHealth}`, bossBarX + bossBarWidth / 2, bossBarY + 13);
    }

    // Wave Banner Notification
    if (world.waveManager.bannerTimer > 0) {
      ctx.textAlign = 'center';
      ctx.shadowBlur = 20;
      ctx.shadowColor = CONFIG.COLORS.player;
      ctx.fillStyle = CONFIG.COLORS.player;
      ctx.font = 'bold 32px "Courier New", monospace';
      ctx.fillText(world.waveManager.bannerText, width / 2, height / 3);
    }

    ctx.restore();
  }

  drawTitleScreen(highScore) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(6, 8, 18, 0.85)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#00f0ff';

    // Title
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 42px "Courier New", monospace';
    ctx.fillText(CONFIG.GAME_TITLE, width / 2, height / 2 - 80);

    ctx.shadowColor = '#ff007f';
    ctx.fillStyle = '#ff007f';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillText('NEON OMEGA PROTOCOL ACTIVE', width / 2, height / 2 - 30);

    // High Score
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffb703';
    ctx.fillStyle = '#ffb703';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText(`HIGH SCORE: ${highScore}`, width / 2, height / 2 + 30);

    // Prompt
    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 20px "Courier New", monospace';
    const pulse = Math.floor(Date.now() / 300) % 2 === 0;
    if (pulse) {
      ctx.fillText('CLICK or ENTER TO START', width / 2, height / 2 + 100);
    }

    ctx.restore();
  }

  drawPauseScreen() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(6, 8, 18, 0.8)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.fillText('GAME PAUSED', width / 2, height / 2 - 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText('PRESS ESC or P TO RESUME', width / 2, height / 2 + 30);

    ctx.restore();
  }

  drawGameOverScreen(score, highScore) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(6, 8, 18, 0.9)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ff007f';

    ctx.fillStyle = '#ff007f';
    ctx.font = 'bold 42px "Courier New", monospace';
    ctx.fillText('GAME OVER', width / 2, height / 2 - 80);

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillText(`FINAL SCORE: ${score}`, width / 2, height / 2 - 20);
    ctx.fillText(`HIGH SCORE: ${highScore}`, width / 2, height / 2 + 20);

    ctx.fillStyle = '#ffb703';
    ctx.font = 'bold 18px "Courier New", monospace';
    const pulse = Math.floor(Date.now() / 300) % 2 === 0;
    if (pulse) {
      ctx.fillText('PRESS R TO RESTART', width / 2, height / 2 + 90);
    }

    ctx.restore();
  }

  drawVictoryScreen(score, highScore) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(6, 8, 18, 0.9)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00f5d4';

    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 42px "Courier New", monospace';
    ctx.fillText('VICTORY: APEX DEFEATED', width / 2, height / 2 - 80);

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillText(`FINAL SCORE: ${score}`, width / 2, height / 2 - 20);
    ctx.fillText(`HIGH SCORE: ${highScore}`, width / 2, height / 2 + 20);

    ctx.fillStyle = '#ffb703';
    ctx.font = 'bold 18px "Courier New", monospace';
    const pulse = Math.floor(Date.now() / 300) % 2 === 0;
    if (pulse) {
      ctx.fillText('PRESS R TO RESTART', width / 2, height / 2 + 90);
    }

    ctx.restore();
  }
}
