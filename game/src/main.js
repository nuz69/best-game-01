import { World } from './world.js';
import { Renderer } from './render.js';
import { Input } from './input.js';
import { audio } from './audio.js';
import { handleShotMode } from './shots.js';

class GameApp {
  constructor() {
    this.canvas = document.getElementById('game');
    this.input = new Input(this.canvas);
    this.renderer = new Renderer(this.canvas);
    this.world = new World();

    this.state = 'title'; // 'title', 'play', 'upgrade', 'pause', 'over', 'victory'
    this.highScore = 0;
    this.lastTime = performance.now();
    this.stats = { wavesSurvived: 0, enemiesDefeated: 0, accuracy: 100 };

    try {
      const saved = localStorage.getItem('synth_surge_highscore');
      if (saved) this.highScore = parseInt(saved, 10) || 0;
    } catch (e) {}

    this._initResize();

    // Expose for automated testing
    window.__game = {
      app: this,
      world: this.world,
      input: this.input
    };
  }

  _initResize() {
    const resize = () => {
      this.renderer.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);
    resize();
  }

  start() {
    // Check if running in ?shot= staging mode
    if (handleShotMode(this)) {
      return;
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  loop(currentTime) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.input.update(this.renderer.camera);

    // Global mute toggle on 'KeyM'
    if (this.input.isKeyPressed('KeyM')) {
      audio.toggleMute();
    }

    switch (this.state) {
      case 'title':
        if (this.input.isStartPressed) {
          audio.init();
          audio.startAmbientMusic();
          this.world.reset();
          this.world.waveManager.bannerTimer = 0;
          this.state = 'play';
        }
        break;

      case 'play':
        if (this.input.isPausePressed) {
          this.world.waveManager.bannerTimer = 0;
          this.state = 'pause';
          break;
        }

        // Check if wave manager switched to upgrade state
        if (this.world.waveManager.waveState === 'upgrade') {
          this.state = 'upgrade';
          audio.waveStart();
          break;
        }

        this.world.step(dt, this.input);
        this.renderer.updateCamera(this.world.player.x, this.world.player.y);

        // Check victory condition
        if (this.world.isVictory) {
          this.state = 'victory';
          this.world.waveManager.bannerTimer = 0;
          this._updateStats();
          if (this.world.score > this.highScore) {
            this.highScore = this.world.score;
            try {
              localStorage.setItem('synth_surge_highscore', this.highScore.toString());
            } catch (e) {}
          }
          break;
        }

        // Check game over condition
        if (this.world.player.health <= 0) {
          this.state = 'over';
          this.world.waveManager.bannerTimer = 0;
          this._updateStats();
          if (this.world.score > this.highScore) {
            this.highScore = this.world.score;
            try {
              localStorage.setItem('synth_surge_highscore', this.highScore.toString());
            } catch (e) {}
          }
        }
        break;

      case 'upgrade':
        // Listen for keys 1, 2, 3 or mouse click
        if (this.input.isKeyPressed('Digit1') || this.input.isKeyPressed('Numpad1')) {
          this.world.applyUpgrade(0);
          this.state = 'play';
        } else if (this.input.isKeyPressed('Digit2') || this.input.isKeyPressed('Numpad2')) {
          this.world.applyUpgrade(1);
          this.state = 'play';
        } else if (this.input.isKeyPressed('Digit3') || this.input.isKeyPressed('Numpad3')) {
          this.world.applyUpgrade(2);
          this.state = 'play';
        } else if (this.input.mouse.pressed) {
          // Check card click
          const width = this.canvas.width;
          const height = this.canvas.height;
          const cards = this.world.upgradeCards;
          const cardWidth = 300;
          const cardHeight = 180;
          const gap = 30;
          const totalWidth = cards.length * cardWidth + (cards.length - 1) * gap;
          const startX = (width - totalWidth) / 2;
          const startY = height / 2 - 80;

          for (let i = 0; i < cards.length; i++) {
            const cx = startX + i * (cardWidth + gap);
            const cy = startY;
            if (this.input.mouse.x >= cx && this.input.mouse.x <= cx + cardWidth &&
                this.input.mouse.y >= cy && this.input.mouse.y <= cy + cardHeight) {
              this.world.applyUpgrade(i);
              this.state = 'play';
              break;
            }
          }
        }
        break;

      case 'pause':
        if (this.input.isPausePressed || this.input.isStartPressed) {
          this.state = 'play';
        } else if (this.input.isRestartPressed) {
          this.world.reset();
          this.world.waveManager.bannerTimer = 0;
          this.state = 'play';
        } else if (this.input.isKeyPressed('KeyQ')) {
          this.world.waveManager.bannerTimer = 0;
          this.state = 'title';
        }
        break;

      case 'over':
      case 'victory':
        if (this.input.isRestartPressed || this.input.isStartPressed) {
          this.world.reset();
          this.world.waveManager.bannerTimer = 0;
          this.state = 'play';
        }
        break;
    }
  }

  _updateStats() {
    const survived = Math.max(0, this.world.waveManager.currentWave - (this.world.isVictory ? 0 : 1));
    const fired = this.world.shotsFired;
    const hit = this.world.shotsHit;
    const accuracy = fired > 0 ? Math.min(100, Math.round((hit / fired) * 100)) : 100;
    this.stats = {
      wavesSurvived: survived,
      enemiesDefeated: this.world.kills,
      accuracy: accuracy
    };
  }

  render() {
    this.renderer.clear();

    switch (this.state) {
      case 'title':
        this.renderer.renderWorld(this.world);
        this.renderer.drawTitleScreen(this.highScore, audio.muted);
        break;

      case 'play':
      case 'upgrade':
        this.renderer.renderWorld(this.world);
        if (this.state === 'upgrade') {
          this.renderer.drawUpgradeScreen(this.world);
        }
        break;

      case 'pause':
        this.renderer.renderWorld(this.world);
        this.renderer.drawPauseScreen(audio.muted);
        break;

      case 'over':
        this.renderer.renderWorld(this.world);
        this.renderer.drawGameOverScreen(this.world.score, this.highScore, this.stats);
        break;

      case 'victory':
        this.renderer.renderWorld(this.world);
        this.renderer.drawVictoryScreen(this.world.score, this.highScore, this.stats);
        break;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new GameApp();
  app.start();
});
