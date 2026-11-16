export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.prevKeys = {};
    this.justPressed = new Set();
    this.mouse = {
      x: 0,
      y: 0,
      worldX: 0,
      worldY: 0,
      down: false,
      pressed: false,
      prevDown: false
    };

    this._initListeners();
  }

  _initListeners() {
    window.addEventListener('keydown', (e) => {
      // Prevent scrolling on space / arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyP'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this.keys[e.code]) {
        this.justPressed.add(e.code);
      }
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.down = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouse.down = false;
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  update(camera = { x: 0, y: 0, zoom: 1 }) {
    // Copy current key states to prevKeys
    this.prevKeys = { ...this.keys };

    // Mouse press-edge detection
    this.mouse.pressed = this.mouse.down && !this.mouse.prevDown;
    this.mouse.prevDown = this.mouse.down;

    // Calculate world coordinates for mouse
    const rect = this.canvas.getBoundingClientRect();
    const clientX = this.mouse.x;
    const clientY = this.mouse.y;
    const canvasCenterX = rect.width / 2;
    const canvasCenterY = rect.height / 2;

    this.mouse.worldX = camera.x + (clientX - canvasCenterX) / camera.zoom;
    this.mouse.worldY = camera.y + (clientY - canvasCenterY) / camera.zoom;
  }

  isKeyDown(code) {
    return !!this.keys[code];
  }

  isKeyPressed(code) {
    const pressed = (!!this.keys[code] && !this.prevKeys[code]) || this.justPressed.has(code);
    this.justPressed.delete(code);
    return pressed;
  }

  // Convenience helpers
  get moveX() {
    let x = 0;
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) x -= 1;
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) x += 1;
    return x;
  }

  get moveY() {
    let y = 0;
    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) y -= 1;
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) y += 1;
    return y;
  }

  get isFiring() {
    return this.mouse.down || this.isKeyDown('Space');
  }

  get isPausePressed() {
    return this.isKeyPressed('Escape') || this.isKeyPressed('KeyP');
  }

  get isStartPressed() {
    return this.isKeyPressed('Enter') || this.mouse.pressed;
  }

  get isRestartPressed() {
    return this.isKeyPressed('KeyR');
  }
}
