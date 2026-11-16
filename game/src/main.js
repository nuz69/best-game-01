import { World } from './world.js';
import { Renderer } from './render.js';
import { Input } from './input.js';

class GameApp {
  constructor() {
    this.canvas = document.getElementById('game');
    this.input = new Input(this.canvas);
    this.renderer = new Renderer(this.canvas);
    this.world = new World();

    this.state = 'title'; // 'title', 'play', 'pause', 'over'
    this.highScore = 0;
    this.lastTime = performance.now();

    try {
      const saved = localStorage.getItem('synth_surge_highscore');
      if (saved) this.highScore = parseInt(saved, 10) || 0;
    } catch (e) {
      // localStorage disabled or unavailable
    }

    this._initResize();
  }

  _initResize() {
    const resize = () => {
      this.renderer.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);
    resize();
  }

  start() {
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

    switch (this.state) {
      case 'title':
        if (this.input.isStartPressed) {
          this.world.reset();
          this.state = 'play';
        }
        break;

      case 'play':
        if (this.input.isPausePressed) {
          this.state = 'pause';
          break;
        }

        this.world.step(dt, this.input);
        this.renderer.updateCamera(this.world.player.x, this.world.player.y);

        // Check game over condition
        if (this.world.player.health <= 0) {
          this.state = 'over';
          if (this.world.score > this.highScore) {
            this.highScore = this.world.score;
            try {
              localStorage.setItem('synth_surge_highscore', this.highScore.toString());
            } catch (e) {}
          }
        }
        break;

      case 'pause':
        if (this.input.isPausePressed || this.input.isStartPressed) {
          this.state = 'play';
        }
        break;

      case 'over':
        if (this.input.isRestartPressed || this.input.isStartPressed) {
          this.world.reset();
          this.state = 'play';
        }
        break;
    }
  }

  render() {
    this.renderer.clear();

    switch (this.state) {
      case 'title':
        this.renderer.renderWorld(this.world);
        this.renderer.drawTitleScreen(this.highScore);
        break;

      case 'play':
        this.renderer.renderWorld(this.world);
        break;

      case 'pause':
        this.renderer.renderWorld(this.world);
        this.renderer.drawPauseScreen();
        break;

      case 'over':
        this.renderer.renderWorld(this.world);
        this.renderer.drawGameOverScreen(this.world.score, this.highScore);
        break;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new GameApp();
  app.start();
});
