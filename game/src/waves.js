import { Enemy } from './enemies.js';

export const UPGRADE_CARDS = [
  {
    id: 'quantum_overclock',
    title: 'Quantum Overclock',
    description: '+25% Weapon Fire Rate',
    apply: (player) => {
      player.upgrades.fireRate *= 1.25;
    }
  },
  {
    id: 'prism_array',
    title: 'Prism Array',
    description: '+1 Spread Shot',
    apply: (player) => {
      player.upgrades.spread += 1;
    }
  },
  {
    id: 'aegis_barrier',
    title: 'Aegis Barrier',
    description: 'Energy Shield (absorbs 1 heavy hit)',
    apply: (player) => {
      player.upgrades.shield = true;
    }
  },
  {
    id: 'grav_magnet',
    title: 'Grav-Magnet',
    description: '+50% Energy Pickup Attraction Radius',
    apply: (player) => {
      player.upgrades.magnet *= 1.5;
    }
  },
  {
    id: 'thruster_surge',
    title: 'Thruster Surge',
    description: '+20% Vessel Movement Speed',
    apply: (player) => {
      player.upgrades.speed *= 1.2;
    }
  },
  {
    id: 'core_vitality',
    title: 'Core Vitality',
    description: 'Full Heal +25 Max HP',
    apply: (player) => {
      player.maxHealth += 25;
      player.health = player.maxHealth;
    }
  }
];

export class WaveManager {
  constructor() {
    this.currentWave = 1;
    this.maxWaves = 10;
    this.waveState = 'spawning'; // 'spawning', 'active', 'cleared', 'upgrade'
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.bannerTimer = 0.0;
    this.bannerText = '';
  }

  reset(rng = Math.random) {
    this.currentWave = 1;
    this.waveState = 'spawning';
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.startWave(1, rng);
  }

  startWave(waveNum, rng = Math.random) {
    this.currentWave = waveNum;
    this.waveState = 'spawning';
    this.spawnQueue = this._getWaveComposition(waveNum, rng);
    this.spawnTimer = 0;
    this.bannerText = waveNum === 10 ? 'FINAL WAVE: APEX CORE' : `WAVE ${waveNum}`;
    this.bannerTimer = 2.5;
  }

  _getWaveComposition(waveNum, rng = Math.random) {
    const queue = [];
    let composition = [];

    switch (waveNum) {
      case 1:
        composition = [{ type: 'glowite', count: 6 }];
        break;
      case 2:
        composition = [{ type: 'glowite', count: 8 }, { type: 'vexar', count: 2 }];
        break;
      case 3:
        composition = [{ type: 'glowite', count: 6 }, { type: 'splitNode', count: 4 }];
        break;
      case 4:
        composition = [{ type: 'vexar', count: 5 }, { type: 'goliathX', count: 2 }];
        break;
      case 5:
        composition = [{ type: 'glowite', count: 8 }, { type: 'splitNode', count: 4 }, { type: 'phantasm', count: 2 }];
        break;
      case 6:
        composition = [{ type: 'vexar', count: 6 }, { type: 'goliathX', count: 3 }, { type: 'glowite', count: 4 }];
        break;
      case 7:
        composition = [{ type: 'phantasm', count: 5 }, { type: 'splitNode', count: 4 }, { type: 'vexar', count: 4 }];
        break;
      case 8:
        composition = [{ type: 'goliathX', count: 4 }, { type: 'phantasm', count: 4 }, { type: 'vexar', count: 6 }];
        break;
      case 9:
        composition = [{ type: 'glowite', count: 10 }, { type: 'vexar', count: 6 }, { type: 'splitNode', count: 4 }, { type: 'goliathX', count: 2 }, { type: 'phantasm', count: 3 }];
        break;
      case 10:
        composition = [{ type: 'boss', count: 1 }];
        break;
      default:
        composition = [{ type: 'glowite', count: 10 }];
    }

    for (const group of composition) {
      for (let i = 0; i < group.count; i++) {
        queue.push(group.type);
      }
    }

    // Shuffle queue using rng
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }

    return queue;
  }

  update(dt, world) {
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
    }

    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = 1.0;
        const type = this.spawnQueue.pop();
        this._spawnEnemyAtBorder(type, world, world.rng);
      }
    }
  }

  _spawnEnemyAtBorder(type, world, rng = Math.random) {
    const side = Math.floor(rng() * 4);
    let x = 0, y = 0;
    const margin = 100;

    switch (side) {
      case 0:
        x = rng() * world.width;
        y = -margin;
        break;
      case 1:
        x = rng() * world.width;
        y = world.height + margin;
        break;
      case 2:
        x = -margin;
        y = rng() * world.height;
        break;
      case 3:
        x = world.width + margin;
        y = rng() * world.height;
        break;
    }

    world.enemies.push(new Enemy(x, y, type));
  }

  generateRandomUpgradeCards(count = 3, rng = Math.random) {
    const pool = [...UPGRADE_CARDS];
    const selected = [];
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(rng() * pool.length);
      selected.push(pool.splice(idx, 1)[0]);
    }
    return selected;
  }
}
