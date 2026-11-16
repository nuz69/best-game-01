export const CONFIG = {
  GAME_TITLE: 'SYNTH SURGE: NEON OMEGA',
  ARENA_WIDTH: 2400,
  ARENA_HEIGHT: 2400,
  COLORS: {
    bg: '#060812',
    grid: '#0e1628',
    player: '#00f0ff',
    playerGlow: '#00f0ff',
    enemyMagenta: '#ff007f',
    enemyAmber: '#ffb703',
    pickupEmerald: '#00f5d4',
    bullet: '#00f0ff',
    textWhite: '#ffffff',
    hudBar: '#00f0ff',
    hudBg: '#111827'
  },
  SCORES: {
    glowite: 100,
    vexar: 150,
    splitNode: 200,
    goliathX: 400,
    phantasm: 250,
    boss: 2000
  },
  COMBO: {
    windowDuration: 3.0, // seconds
    maxMultiplier: 8
  },
  PLAYER: {
    maxSpeed: 450,
    acceleration: 1800,
    friction: 6.0,
    radius: 16,
    baseFireRate: 8, // shots per second
    bulletSpeed: 1260,
    maxHealth: 100
  }
};
