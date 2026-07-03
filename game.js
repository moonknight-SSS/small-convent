const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startButton = document.getElementById("startButton");
const coinCount = document.getElementById("coinCount");
const lifeCount = document.getElementById("lifeCount");
const timeCount = document.getElementById("timeCount");
const joystick = document.getElementById("joystick");
const joystickKnob = document.getElementById("joystickKnob");
const stageWrap = document.querySelector(".stage-wrap");

const playerSprite = new Image();
playerSprite.src = "assets/player-real3d-frames.png";
playerSprite.onload = () => scheduleLayoutSync();

const keys = {
  left: false,
  right: false,
  jump: false
};

let touchAxis = 0;

const level = {
  width: 5600,
  height: 540,
  startX: 96,
  startY: 360,
  flagX: 5350,
  solids: [
    { x: 0, y: 472, w: 820, h: 68, type: "ground" },
    { x: 940, y: 472, w: 620, h: 68, type: "ground" },
    { x: 1680, y: 472, w: 760, h: 68, type: "ground" },
    { x: 2560, y: 472, w: 560, h: 68, type: "ground" },
    { x: 3240, y: 472, w: 740, h: 68, type: "ground" },
    { x: 4100, y: 472, w: 1500, h: 68, type: "ground" },

    { x: 280, y: 400, w: 150, h: 28, type: "platform" },
    { x: 500, y: 350, w: 160, h: 28, type: "platform" },
    { x: 720, y: 302, w: 150, h: 28, type: "platform" },

    { x: 1030, y: 390, w: 190, h: 28, type: "platform" },
    { x: 1300, y: 336, w: 180, h: 28, type: "platform" },
    { x: 1540, y: 280, w: 170, h: 28, type: "platform" },

    { x: 1820, y: 386, w: 110, h: 86, type: "pipe" },
    { x: 2000, y: 350, w: 120, h: 122, type: "pipe" },
    { x: 2200, y: 312, w: 130, h: 160, type: "pipe" },

    { x: 2620, y: 414, w: 130, h: 28, type: "platform" },
    { x: 2840, y: 356, w: 170, h: 28, type: "platform" },
    { x: 3060, y: 300, w: 160, h: 28, type: "platform" },
    { x: 3330, y: 344, w: 180, h: 28, type: "platform" },
    { x: 3620, y: 286, w: 170, h: 28, type: "platform" },

    { x: 4180, y: 416, w: 150, h: 56, type: "step" },
    { x: 4330, y: 376, w: 150, h: 96, type: "step" },
    { x: 4480, y: 336, w: 150, h: 136, type: "step" },
    { x: 4760, y: 386, w: 160, h: 28, type: "platform" },
    { x: 5020, y: 342, w: 190, h: 28, type: "platform" },

    { x: 560, y: 238, w: 44, h: 44, type: "question", hit: false },
    { x: 604, y: 238, w: 44, h: 44, type: "brick" },
    { x: 1338, y: 226, w: 44, h: 44, type: "question", hit: false },
    { x: 1382, y: 226, w: 44, h: 44, type: "brick" },
    { x: 2068, y: 216, w: 44, h: 44, type: "question", hit: false },
    { x: 2860, y: 218, w: 44, h: 44, type: "brick" },
    { x: 2904, y: 218, w: 44, h: 44, type: "question", hit: false },
    { x: 2948, y: 218, w: 44, h: 44, type: "brick" },
    { x: 4700, y: 240, w: 44, h: 44, type: "question", hit: false },
    { x: 4744, y: 240, w: 44, h: 44, type: "brick" },
    { x: 4788, y: 240, w: 44, h: 44, type: "brick" }
  ],
  coins: [
    { x: 330, y: 354 }, { x: 384, y: 354 }, { x: 546, y: 306 }, { x: 604, y: 306 }, { x: 766, y: 258 },
    { x: 1088, y: 346 }, { x: 1148, y: 346 }, { x: 1352, y: 292 }, { x: 1412, y: 292 }, { x: 1586, y: 236 },
    { x: 1860, y: 338 }, { x: 2046, y: 300 }, { x: 2244, y: 260 },
    { x: 2666, y: 372 }, { x: 2890, y: 312 }, { x: 3130, y: 256 }, { x: 3388, y: 300 }, { x: 3680, y: 242 },
    { x: 4218, y: 374 }, { x: 4368, y: 334 }, { x: 4518, y: 294 },
    { x: 4814, y: 344 }, { x: 5070, y: 298 }, { x: 5130, y: 298 }, { x: 5268, y: 424 }
  ],
  enemies: [
    { x: 640, y: 430, w: 38, h: 34, vx: -0.55, min: 120, max: 760, dead: false },
    { x: 1160, y: 430, w: 38, h: 34, vx: -0.72, min: 970, max: 1500, dead: false },
    { x: 1910, y: 430, w: 38, h: 34, vx: 0.65, min: 1710, max: 2380, dead: false },
    { x: 2730, y: 430, w: 38, h: 34, vx: -0.74, min: 2580, max: 3090, dead: false },
    { x: 3500, y: 430, w: 38, h: 34, vx: 0.75, min: 3260, max: 3920, dead: false },
    { x: 4880, y: 430, w: 38, h: 34, vx: -0.82, min: 4620, max: 5260, dead: false }
  ],
  decorations: [
    { type: "gate", x: 96, y: 280 },
    { type: "sign", x: 248, y: 428, text: "起点" },
    { type: "tree", x: 680, y: 384, scale: 1 },
    { type: "lamp", x: 910, y: 348 },
    { type: "building", x: 1120, y: 262, w: 420, h: 210, label: "教学楼" },
    { type: "bench", x: 1500, y: 440 },
    { type: "tree", x: 1670, y: 388, scale: 0.86 },
    { type: "billboard", x: 2360, y: 326, text: "图书馆屋顶路线" },
    { type: "building", x: 2960, y: 220, w: 500, h: 252, label: "图书馆" },
    { type: "lamp", x: 3540, y: 344 },
    { type: "tree", x: 3910, y: 384, scale: 1.08 },
    { type: "sign", x: 4138, y: 428, text: "阶梯区" },
    { type: "track", x: 4550, y: 438, w: 980 },
    { type: "billboard", x: 4920, y: 314, text: "终点冲刺" },
    { type: "tree", x: 5300, y: 380, scale: 0.9 }
  ]
};

const player = {
  x: level.startX,
  y: level.startY,
  w: 42,
  h: 58,
  vx: 0,
  vy: 0,
  facing: 1,
  onGround: false,
  lives: 3,
  coins: 0,
  invincible: 0,
  jumpGrace: 0,
  inputAxis: 0,
  animState: "idle",
  animTimer: 0,
  startTimer: 0,
  stopTimer: 0,
  landTimer: 0
};

let cameraX = 0;
let state = "ready";
let lastTime = 0;
let timeLeft = 180;
let levelElapsed = 0;
let particles = [];
let audioContext = null;
let layoutSyncFrame = 0;
let layoutSyncTimers = [];

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.getBoundingClientRect().width;
  const height = canvas.clientHeight || canvas.getBoundingClientRect().height;
  canvas.width = Math.max(320, Math.floor(width * ratio));
  canvas.height = Math.max(240, Math.floor(height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function syncLayout() {
  updateViewportMode();
  resizeCanvas();
  render(performance.now());
}

function scheduleLayoutSync() {
  if (layoutSyncFrame) cancelAnimationFrame(layoutSyncFrame);
  layoutSyncTimers.forEach(clearTimeout);
  layoutSyncTimers = [];

  syncLayout();
  layoutSyncFrame = requestAnimationFrame(() => {
    layoutSyncFrame = 0;
    syncLayout();
  });
  layoutSyncTimers = [80, 220, 520].map((delay) => (
    setTimeout(syncLayout, delay)
  ));
}

function updateViewportMode() {
  const isPortrait = window.innerHeight > window.innerWidth;
  const isPhoneLike = Math.min(window.innerWidth, window.innerHeight) <= 760 || navigator.maxTouchPoints > 0;
  document.documentElement.classList.toggle("force-landscape", isPortrait && isPhoneLike);
}

window.addEventListener("resize", scheduleLayoutSync);
window.addEventListener("orientationchange", scheduleLayoutSync);
window.addEventListener("pageshow", scheduleLayoutSync);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) scheduleLayoutSync();
});
window.visualViewport?.addEventListener("resize", scheduleLayoutSync);
if (window.ResizeObserver && stageWrap) {
  new ResizeObserver(scheduleLayoutSync).observe(stageWrap);
}
scheduleLayoutSync();

function getWorldScale() {
  return canvas.clientHeight / level.height;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function resetLevel(keepLives = true) {
  player.x = level.startX;
  player.y = level.startY;
  player.vx = 0;
  player.vy = 0;
  player.facing = 1;
  player.onGround = false;
  player.invincible = 70;
  player.jumpGrace = 0;
  player.inputAxis = 0;
  player.animState = "idle";
  player.animTimer = 0;
  player.startTimer = 0;
  player.stopTimer = 0;
  player.landTimer = 0;
  player.coins = keepLives ? player.coins : 0;
  if (!keepLives) player.lives = 3;
  timeLeft = 180;
  levelElapsed = 0;
  cameraX = 0;
  particles = [];
  level.coins.forEach((coin) => {
    coin.collected = false;
  });
  level.enemies.forEach((enemy) => {
    enemy.dead = false;
  });
  level.solids.forEach((solid) => {
    if (solid.type === "question") solid.hit = false;
  });
  updateHud();
}

function startGame(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  if (state === "playing") return;

  resetLevel(false);
  state = "playing";
  overlay.classList.add("hidden");
  scheduleLayoutSync();
  requestLandscapeFullscreen();
  playTone(440, 0.08, "square", 0.05);
  setTimeout(scheduleLayoutSync, 180);
  setTimeout(scheduleLayoutSync, 620);
}

function requestLandscapeFullscreen() {
  const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 760;
  if (!isSmallScreen) return;

  const root = document.documentElement;
  try {
    if (!document.fullscreenElement && root.requestFullscreen) {
      Promise.resolve(root.requestFullscreen()).then(scheduleLayoutSync).catch(() => {});
    }

    if (screen.orientation?.lock) {
      Promise.resolve(screen.orientation.lock("landscape")).then(scheduleLayoutSync).catch(() => {});
    }
  } catch {
    scheduleLayoutSync();
  }
}

function startFromOverlay(event) {
  if (overlay.classList.contains("hidden")) return;
  startGame(event);
}

function showOverlay(title, text, button) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  startButton.textContent = button;
  overlay.classList.remove("hidden");
}

function updateHud() {
  coinCount.textContent = player.coins;
  lifeCount.textContent = player.lives;
  timeCount.textContent = Math.max(0, Math.ceil(timeLeft));
}

function playTone(freq, duration, type = "sine", volume = 0.04) {
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    audioContext = null;
  }
}

function spawnParticles(x, y, color, amount = 8) {
  for (let i = 0; i < amount; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 3.2,
      vy: -Math.random() * 3.4 - 0.5,
      life: 34 + Math.random() * 20,
      color
    });
  }
}

function collectCoin(coin) {
  if (coin.collected) return;
  coin.collected = true;
  player.coins += 1;
  spawnParticles(coin.x + 12, coin.y + 12, "#ffd44d", 10);
  playTone(920, 0.08, "triangle", 0.035);
  updateHud();
}

function hitQuestionBlock(block) {
  if (block.hit) return;
  block.hit = true;
  player.coins += 1;
  spawnParticles(block.x + block.w / 2, block.y - 4, "#ffd44d", 16);
  playTone(760, 0.12, "triangle", 0.045);
  updateHud();
}

function moveWithCollisions(entity, solids) {
  entity.x += entity.vx;
  for (const solid of solids) {
    if (!rectsOverlap(entity, solid)) continue;
    if (entity.vx > 0) entity.x = solid.x - entity.w;
    if (entity.vx < 0) entity.x = solid.x + solid.w;
    entity.vx = 0;
  }

  entity.y += entity.vy;
  entity.onGround = false;
  for (const solid of solids) {
    if (!rectsOverlap(entity, solid)) continue;
    if (entity.vy > 0) {
      entity.y = solid.y - entity.h;
      entity.vy = 0;
      entity.onGround = true;
      entity.jumpGrace = 8;
    } else if (entity.vy < 0) {
      entity.y = solid.y + solid.h;
      entity.vy = 0;
      if (solid.type === "question") hitQuestionBlock(solid);
      if (solid.type === "brick") {
        spawnParticles(entity.x + entity.w / 2, solid.y + solid.h, "#b66a35", 6);
        playTone(180, 0.08, "square", 0.025);
      }
    }
  }
}

function damagePlayer() {
  if (player.invincible > 0 || state !== "playing") return;
  player.lives -= 1;
  updateHud();
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, "#e24b3d", 18);
  playTone(120, 0.18, "sawtooth", 0.04);
  if (player.lives <= 0) {
    state = "gameover";
    showOverlay("闯关失败", `最终金币：${player.coins}。按 Enter 重新挑战。`, "重新开始");
  } else {
    resetLevel(true);
  }
}

function updatePlayer(dt) {
  const prevOnGround = player.onGround;
  const prevMoving = Math.abs(player.vx) > 0.45;
  const keyboardAxis = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  const rawAxis = Math.abs(touchAxis) > 0.08 ? touchAxis : keyboardAxis;
  const inputAxis = Math.abs(rawAxis) < 0.08 ? 0 : rawAxis;
  const maxSpeed = 4.25;
  const targetVx = inputAxis * maxSpeed;
  const response = player.onGround ? (inputAxis === 0 ? 0.13 : 0.095) : 0.052;

  player.inputAxis = inputAxis;
  player.vx += (targetVx - player.vx) * response;
  if (inputAxis === 0 && player.onGround && Math.abs(player.vx) < 0.06) player.vx = 0;
  if (inputAxis !== 0) player.facing = inputAxis > 0 ? 1 : -1;

  player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));
  player.vy += 0.64;
  player.vy = Math.min(player.vy, 14);

  if (player.onGround) player.jumpGrace = 10;
  else player.jumpGrace = Math.max(0, player.jumpGrace - 1);

  if (keys.jump && player.jumpGrace > 0) {
    player.vy = -12.4;
    player.onGround = false;
    player.jumpGrace = 0;
    player.animState = "takeoff";
    player.animTimer = 0;
    keys.jump = false;
    spawnParticles(player.x + player.w / 2, player.y + player.h, "#ffffff", 8);
    playTone(520, 0.08, "square", 0.035);
  }

  moveWithCollisions(player, level.solids);

  player.x = Math.max(0, Math.min(level.width - player.w, player.x));
  updatePlayerAnimation(dt, prevOnGround, prevMoving);
  if (player.y > level.height + 120) damagePlayer();
  if (player.invincible > 0) player.invincible -= 1;
}

function updatePlayerAnimation(dt, prevOnGround, prevMoving) {
  player.animTimer += dt;
  player.startTimer = Math.max(0, player.startTimer - dt);
  player.stopTimer = Math.max(0, player.stopTimer - dt);
  player.landTimer = Math.max(0, player.landTimer - dt);

  const moving = Math.abs(player.vx) > 0.28;
  const pressing = Math.abs(player.inputAxis) > 0.08;

  if (!prevOnGround && player.onGround) {
    player.landTimer = 0.16;
    player.animTimer = 0;
    spawnParticles(player.x + player.w / 2, player.y + player.h, "#ffffff", 5);
  }
  if (player.onGround && pressing && !prevMoving) {
    player.startTimer = 0.18;
    player.animTimer = 0;
  }
  if (player.onGround && !pressing && prevMoving && moving) {
    player.stopTimer = 0.2;
    player.animTimer = 0;
  }

  if (!player.onGround) {
    if (player.animState !== "takeoff" || player.animTimer > 0.12) {
      player.animState = player.vy < -2.5 ? "jumpUp" : player.vy > 2.5 ? "fall" : "hang";
    }
  } else if (player.landTimer > 0) {
    player.animState = "land";
  } else if (player.stopTimer > 0) {
    player.animState = "stop";
  } else if (player.startTimer > 0) {
    player.animState = "start";
  } else if (moving) {
    player.animState = "run";
  } else {
    player.animState = "idle";
  }
}

function updateEnemies() {
  for (const enemy of level.enemies) {
    if (enemy.dead) continue;
    enemy.x += enemy.vx;
    if (enemy.x < enemy.min || enemy.x + enemy.w > enemy.max) enemy.vx *= -1;

    const enemyBox = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
    const playerBox = { x: player.x, y: player.y, w: player.w, h: player.h };
    if (!rectsOverlap(playerBox, enemyBox)) continue;

    const stomp = player.vy > 2 && player.y + player.h - enemy.y < 22;
    if (stomp) {
      enemy.dead = true;
      player.vy = -8.4;
      player.coins += 2;
      spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#7c4b2a", 14);
      playTone(330, 0.08, "square", 0.045);
      updateHud();
    } else {
      damagePlayer();
    }
  }
}

function updateCoins() {
  for (const coin of level.coins) {
    if (coin.collected) continue;
    const coinBox = { x: coin.x, y: coin.y, w: 24, h: 24 };
    if (rectsOverlap(player, coinBox)) collectCoin(coin);
  }
}

function updateParticles() {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.14;
    p.life -= 1;
  }
  particles = particles.filter((p) => p.life > 0);
}

function updateGame(dt) {
  if (state !== "playing") return;
  updatePlayer(dt);
  updateEnemies();
  updateCoins();
  updateParticles();

  levelElapsed += dt;
  timeLeft = 180 - levelElapsed;
  if (timeLeft <= 0) damagePlayer();

  const viewWorldW = canvas.clientWidth / getWorldScale();
  cameraX = Math.max(0, Math.min(level.width - viewWorldW, player.x - viewWorldW * 0.42));

  if (player.x + player.w >= level.flagX) {
    state = "win";
    player.coins += Math.max(0, Math.ceil(timeLeft / 5));
    updateHud();
    showOverlay("通关成功", `最终金币：${player.coins}。李小儿已经抵达终点！`, "再玩一次");
    playTone(660, 0.12, "triangle", 0.04);
    setTimeout(() => playTone(880, 0.14, "triangle", 0.04), 120);
  }

  updateHud();
}

function drawRoundedRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawBackground(viewW, viewH) {
  const gradient = ctx.createLinearGradient(0, 0, 0, viewH);
  gradient.addColorStop(0, "#8fd5ff");
  gradient.addColorStop(0.58, "#d8f4ff");
  gradient.addColorStop(1, "#f1fbdd");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.save();
  ctx.translate(-cameraX * 0.18, 0);
  for (let i = -1; i < 8; i += 1) {
    const x = i * 640 + 80;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(x, 82, 28, 0, Math.PI * 2);
    ctx.arc(x + 35, 74, 36, 0, Math.PI * 2);
    ctx.arc(x + 78, 88, 25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(-cameraX * 0.34, 0);
  for (let i = -1; i < 9; i += 1) {
    const x = i * 520;
    ctx.fillStyle = "#86bf74";
    ctx.beginPath();
    ctx.moveTo(x, viewH - 68);
    ctx.lineTo(x + 230, viewH - 260);
    ctx.lineTo(x + 520, viewH - 68);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6cad69";
    ctx.beginPath();
    ctx.moveTo(x + 180, viewH - 68);
    ctx.lineTo(x + 310, viewH - 212);
    ctx.lineTo(x + 520, viewH - 68);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawDecorations(time) {
  const viewWorldW = canvas.clientWidth / getWorldScale();
  for (const item of level.decorations) {
    if (item.x + (item.w || 180) < cameraX - 120 || item.x > cameraX + viewWorldW + 180) continue;
    if (item.type === "building") drawBuilding(item);
    if (item.type === "tree") drawTree(item.x, item.y, item.scale || 1, time);
    if (item.type === "lamp") drawLamp(item.x, item.y);
    if (item.type === "sign") drawSign(item.x, item.y, item.text);
    if (item.type === "bench") drawBench(item.x, item.y);
    if (item.type === "billboard") drawBillboard(item.x, item.y, item.text);
    if (item.type === "gate") drawGate(item.x, item.y);
    if (item.type === "track") drawTrack(item.x, item.y, item.w);
  }
}

function drawBuilding(item) {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.fillStyle = "rgba(74, 109, 139, 0.16)";
  ctx.fillRect(-10, item.h - 6, item.w + 20, 16);
  ctx.fillStyle = "#e9eef5";
  ctx.strokeStyle = "#7d8ea4";
  ctx.lineWidth = 3;
  drawRoundedRect(0, 0, item.w, item.h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#d25d4f";
  ctx.fillRect(-12, 28, item.w + 24, 18);
  ctx.fillStyle = "#f4c64f";
  ctx.fillRect(18, 18, item.w - 36, 8);
  ctx.fillStyle = "#9ed2f1";
  ctx.strokeStyle = "#6a8299";
  ctx.lineWidth = 2;
  for (let y = 62; y < item.h - 42; y += 42) {
    for (let x = 24; x < item.w - 28; x += 58) {
      ctx.fillRect(x, y, 34, 24);
      ctx.strokeRect(x, y, 34, 24);
    }
  }
  ctx.fillStyle = "#586678";
  drawRoundedRect(item.w / 2 - 30, item.h - 52, 60, 52, 6);
  ctx.fill();
  ctx.fillStyle = "#233044";
  ctx.font = "bold 24px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(item.label, item.w / 2, 38);
  ctx.restore();
}

function drawTree(x, y, scale, time) {
  const sway = Math.sin(time * 0.0015 + x) * 3;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#8a5b35";
  drawRoundedRect(-11, 20, 22, 68, 6);
  ctx.fill();
  ctx.translate(sway, 0);
  ctx.fillStyle = "#3e9f64";
  ctx.beginPath();
  ctx.arc(-28, 18, 30, 0, Math.PI * 2);
  ctx.arc(2, -4, 38, 0, Math.PI * 2);
  ctx.arc(34, 18, 30, 0, Math.PI * 2);
  ctx.arc(2, 32, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#66bd7e";
  ctx.beginPath();
  ctx.arc(-8, -12, 12, 0, Math.PI * 2);
  ctx.arc(25, 4, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLamp(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#445064";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 124);
  ctx.lineTo(0, 16);
  ctx.quadraticCurveTo(18, 0, 40, 14);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 216, 96, 0.22)";
  ctx.beginPath();
  ctx.ellipse(46, 32, 42, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd660";
  ctx.strokeStyle = "#805f21";
  ctx.lineWidth = 3;
  drawRoundedRect(27, 17, 34, 26, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawSign(x, y, text) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#6a4a32";
  ctx.fillRect(32, 26, 8, 58);
  ctx.fillStyle = "#f6d06a";
  ctx.strokeStyle = "#7a542d";
  ctx.lineWidth = 3;
  drawRoundedRect(0, 0, 78, 34, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#2a3342";
  ctx.font = "bold 16px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 39, 18);
  ctx.restore();
}

function drawBench(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#394355";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(18, 24);
  ctx.lineTo(10, 58);
  ctx.moveTo(118, 24);
  ctx.lineTo(128, 58);
  ctx.stroke();
  ctx.fillStyle = "#b97943";
  ctx.strokeStyle = "#74482a";
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i += 1) {
    drawRoundedRect(0, i * 12, 142, 8, 3);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawBillboard(x, y, text) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#475569";
  ctx.fillRect(22, 66, 8, 88);
  ctx.fillRect(154, 66, 8, 88);
  ctx.fillStyle = "#fff8df";
  ctx.strokeStyle = "#344054";
  ctx.lineWidth = 4;
  drawRoundedRect(0, 0, 184, 76, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e24b3d";
  ctx.fillRect(0, 0, 184, 16);
  ctx.fillStyle = "#202938";
  ctx.font = "bold 18px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, 92, 48);
  ctx.restore();
}

function drawGate(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#d8e1eb";
  ctx.strokeStyle = "#6c7b8d";
  ctx.lineWidth = 4;
  drawRoundedRect(0, 40, 48, 154, 8);
  ctx.fill();
  ctx.stroke();
  drawRoundedRect(188, 40, 48, 154, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#c9443f";
  drawRoundedRect(-8, 0, 252, 52, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff6d4";
  ctx.font = "bold 22px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("校园跃迁", 118, 34);
  ctx.restore();
}

function drawTrack(x, y, w) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#d25a47";
  drawRoundedRect(0, 0, w, 34, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 2;
  for (let i = 8; i < 34; i += 12) {
    ctx.beginPath();
    ctx.moveTo(10, i);
    ctx.lineTo(w - 10, i);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSolid(solid) {
  if (solid.type === "ground") {
    ctx.fillStyle = "#54a861";
    ctx.fillRect(solid.x, solid.y, solid.w, 14);
    ctx.fillStyle = "#9b6541";
    ctx.fillRect(solid.x, solid.y + 14, solid.w, solid.h - 14);
    ctx.strokeStyle = "rgba(80,44,24,0.35)";
    ctx.lineWidth = 2;
    for (let x = solid.x + 20; x < solid.x + solid.w; x += 46) {
      ctx.beginPath();
      ctx.moveTo(x, solid.y + 16);
      ctx.lineTo(x - 22, solid.y + solid.h);
      ctx.stroke();
    }
    return;
  }

  if (solid.type === "pipe") {
    ctx.fillStyle = "#1f9b5e";
    drawRoundedRect(solid.x, solid.y, solid.w, solid.h, 8);
    ctx.fill();
    ctx.fillStyle = "#2acb78";
    ctx.fillRect(solid.x + 8, solid.y + 8, solid.w * 0.26, solid.h - 12);
    ctx.strokeStyle = "#11603d";
    ctx.lineWidth = 4;
    ctx.strokeRect(solid.x, solid.y, solid.w, solid.h);
    return;
  }

  if (solid.type === "question") {
    ctx.fillStyle = solid.hit ? "#b99b58" : "#f4bd3b";
    ctx.strokeStyle = "#8a5b21";
    ctx.lineWidth = 3;
    drawRoundedRect(solid.x, solid.y, solid.w, solid.h, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = solid.hit ? "#7d6939" : "#ffffff";
    ctx.font = "bold 28px Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(solid.hit ? "·" : "?", solid.x + solid.w / 2, solid.y + solid.h / 2 + 1);
    return;
  }

  ctx.fillStyle = solid.type === "brick" ? "#b6613d" : "#d18b49";
  ctx.strokeStyle = "#7d422a";
  ctx.lineWidth = 3;
  ctx.fillRect(solid.x, solid.y, solid.w, solid.h);
  ctx.strokeRect(solid.x, solid.y, solid.w, solid.h);
  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.beginPath();
  ctx.moveTo(solid.x + 6, solid.y + 13);
  ctx.lineTo(solid.x + solid.w - 6, solid.y + 13);
  ctx.moveTo(solid.x + 6, solid.y + 29);
  ctx.lineTo(solid.x + solid.w - 6, solid.y + 29);
  ctx.stroke();
}

function drawCoin(coin, time) {
  if (coin.collected) return;
  const spin = Math.abs(Math.sin(time * 0.006 + coin.x));
  ctx.save();
  ctx.translate(coin.x + 12, coin.y + 12);
  ctx.scale(0.45 + spin * 0.55, 1);
  ctx.fillStyle = "#ffd44d";
  ctx.strokeStyle = "#c9881c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.beginPath();
  ctx.moveTo(-2, -9);
  ctx.lineTo(-2, 9);
  ctx.stroke();
  ctx.restore();
}

function drawEnemy(enemy, time) {
  if (enemy.dead) return;
  const bob = Math.sin(time * 0.01 + enemy.x) * 2;
  ctx.save();
  ctx.translate(enemy.x, enemy.y + bob);
  ctx.fillStyle = "#875332";
  drawRoundedRect(0, 7, enemy.w, enemy.h - 7, 10);
  ctx.fill();
  ctx.fillStyle = "#b36a3e";
  ctx.beginPath();
  ctx.arc(enemy.w / 2, 9, enemy.w / 2, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(13, 15, 5, 0, Math.PI * 2);
  ctx.arc(26, 15, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#121212";
  ctx.beginPath();
  ctx.arc(14, 16, 2, 0, Math.PI * 2);
  ctx.arc(25, 16, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3b2418";
  ctx.fillRect(4, enemy.h - 2, 12, 5);
  ctx.fillRect(22, enemy.h - 2, 12, 5);
  ctx.restore();
}

function drawPlayer(time) {
  const blink = player.invincible > 0 && Math.floor(player.invincible / 5) % 2 === 0;
  if (blink) return;

  if (playerSprite.complete && playerSprite.naturalWidth > 0) {
    const frameW = 320;
    const frameH = 380;
    const runFrame = Math.floor(time / 165) % 2 === 0 ? 1 : 2;
    let frame = 0;
    let yOffset = 0;
    let squashX = 1;
    let squashY = 1;
    let tilt = 0;

    if (player.animState === "start") {
      const phase = Math.min(2, Math.floor((0.18 - player.startTimer) / 0.06));
      frame = [0, 1, 2][phase];
      tilt = 0.035 * player.facing;
    } else if (player.animState === "stop") {
      const phase = Math.min(2, Math.floor((0.2 - player.stopTimer) / 0.07));
      frame = [runFrame, 1, 0][phase];
      tilt = -0.045 * player.facing;
    } else if (player.animState === "takeoff") {
      frame = player.animTimer < 0.07 ? 1 : 3;
      yOffset = -3;
    } else if (player.animState === "jumpUp") {
      frame = 3;
      yOffset = -5;
      tilt = 0.035 * player.facing;
    } else if (player.animState === "hang") {
      frame = 3;
      yOffset = -2;
    } else if (player.animState === "fall") {
      frame = Math.floor(time / 140) % 2 === 0 ? 3 : 2;
      tilt = -0.025 * player.facing;
    } else if (player.animState === "land") {
      frame = player.landTimer > 0.08 ? 3 : 0;
      squashX = 1.04;
      squashY = 0.96;
    } else if (player.animState === "run") {
      frame = runFrame;
    }

    const drawH = Math.round(Math.min(205, Math.max(160, level.height * 0.34)));
    const drawW = Math.round(drawH * (frameW / frameH));
    const footY = player.y + player.h + 5;
    const drawY = footY - drawH + yOffset;

    ctx.save();
    ctx.globalAlpha = player.invincible > 0 ? 0.82 : 1;
    ctx.fillStyle = "rgba(16, 24, 39, 0.22)";
    ctx.beginPath();
    ctx.ellipse(player.x + player.w / 2, footY - 2, drawW * 0.26, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (player.facing < 0) {
      ctx.translate(player.x + player.w / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(0, footY);
      ctx.rotate(-tilt);
      ctx.scale(squashX, squashY);
      ctx.drawImage(playerSprite, frame * frameW, 0, frameW, frameH, -drawW / 2, drawY - footY, drawW, drawH);
    } else {
      ctx.translate(player.x + player.w / 2, footY);
      ctx.rotate(tilt);
      ctx.scale(squashX, squashY);
      ctx.drawImage(playerSprite, frame * frameW, 0, frameW, frameH, -drawW / 2, drawY - footY, drawW, drawH);
    }
    ctx.restore();
    return;
  }

  if (solid.type === "step") {
    ctx.fillStyle = "#7ab06b";
    ctx.fillRect(solid.x, solid.y, solid.w, 12);
    ctx.fillStyle = "#a06b47";
    ctx.fillRect(solid.x, solid.y + 12, solid.w, solid.h - 12);
    ctx.strokeStyle = "rgba(64, 38, 23, 0.38)";
    ctx.lineWidth = 3;
    ctx.strokeRect(solid.x, solid.y, solid.w, solid.h);
    return;
  }

  const walk = Math.sin(time * 0.016) * Math.min(1, Math.abs(player.vx) / 4);
  const jumpTilt = player.onGround ? 0 : player.vy * 0.012;

  ctx.save();
  ctx.translate(player.x + player.w / 2, player.y + player.h);
  ctx.scale(player.facing, 1);
  ctx.rotate(jumpTilt);

  ctx.fillStyle = "#1b2230";
  ctx.fillRect(-16, -3, 12, 6 + Math.max(0, walk * 4));
  ctx.fillRect(4, -3, 12, 6 + Math.max(0, -walk * 4));

  ctx.strokeStyle = "#1c2635";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-11, -9);
  ctx.lineTo(-12 - walk * 7, -23);
  ctx.moveTo(11, -9);
  ctx.lineTo(12 + walk * 7, -23);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  drawRoundedRect(-17, -35, 34, 30, 8);
  ctx.fill();
  ctx.strokeStyle = "#ced7e0";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#f3c433";
  ctx.beginPath();
  ctx.moveTo(-14, -34);
  ctx.lineTo(0, -14);
  ctx.lineTo(14, -34);
  ctx.lineTo(8, -34);
  ctx.lineTo(0, -23);
  ctx.lineTo(-8, -34);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f0bd98";
  ctx.beginPath();
  ctx.ellipse(0, -58, 23, 27, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#11151d";
  ctx.beginPath();
  ctx.ellipse(-5, -77, 24, 13, -0.12, 0, Math.PI * 2);
  ctx.ellipse(9, -72, 16, 10, 0.16, 0, Math.PI * 2);
  ctx.ellipse(-17, -66, 9, 12, -0.36, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#101418";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-18, -58);
  ctx.lineTo(-6, -58);
  ctx.moveTo(6, -58);
  ctx.lineTo(18, -58);
  ctx.moveTo(-6, -58);
  ctx.lineTo(6, -58);
  ctx.stroke();

  ctx.strokeStyle = "#101418";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-18, -64, 13, 10, 3);
  ctx.roundRect(5, -64, 13, 10, 3);
  ctx.stroke();

  ctx.fillStyle = "#1b1f28";
  ctx.beginPath();
  ctx.arc(-11, -59, 2, 0, Math.PI * 2);
  ctx.arc(11, -59, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#cf6c66";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(1, -48, 5, 0, Math.PI);
  ctx.stroke();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, -67, 25, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#d9e2ea";
  ctx.lineWidth = 2;
  drawRoundedRect(-30, -65, 8, 18, 4);
  ctx.fill();
  ctx.stroke();
  drawRoundedRect(22, -65, 8, 18, 4);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawFlag() {
  ctx.save();
  ctx.translate(level.flagX, 0);
  ctx.fillStyle = "#384150";
  ctx.fillRect(0, 168, 8, 304);
  ctx.fillStyle = "#e24b3d";
  ctx.beginPath();
  ctx.moveTo(8, 176);
  ctx.lineTo(118, 206);
  ctx.lineTo(8, 236);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffcf4d";
  ctx.beginPath();
  ctx.arc(4, 164, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / 44);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    ctx.globalAlpha = 1;
  }
}

function render(time = 0) {
  const viewW = canvas.clientWidth;
  const viewH = canvas.clientHeight;
  const scale = getWorldScale();
  drawBackground(viewW, viewH);

  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-cameraX, 0);
  drawDecorations(time);
  for (const solid of level.solids) drawSolid(solid);
  for (const coin of level.coins) drawCoin(coin, time);
  for (const enemy of level.enemies) drawEnemy(enemy, time);
  drawFlag();
  drawParticles();
  drawPlayer(time);
  ctx.restore();
}

function loop(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  updateGame(dt);
  render(time);
  requestAnimationFrame(loop);
}

function mapKey(code, down) {
  if (code === "ArrowLeft" || code === "KeyA") keys.left = down;
  if (code === "ArrowRight" || code === "KeyD") keys.right = down;
  if (code === "ArrowUp" || code === "KeyW" || code === "Space") {
    if (down) keys.jump = true;
  }
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Enter" && state !== "playing") startGame();
  mapKey(event.code, true);
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) event.preventDefault();
});

window.addEventListener("keyup", (event) => {
  mapKey(event.code, false);
});

if (joystick && joystickKnob) {
  let joystickPointer = null;
  const joystickRadius = 64;

  const setJoystick = (event) => {
    const rect = joystick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const distance = Math.hypot(dx, dy);
    const clamped = Math.min(joystickRadius, distance);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clamped;
    const knobY = Math.sin(angle) * clamped;
    joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
    touchAxis = Math.abs(knobX / joystickRadius) < 0.12 ? 0 : knobX / joystickRadius;
  };

  const resetJoystick = () => {
    joystickPointer = null;
    touchAxis = 0;
    joystickKnob.style.transform = "translate(-50%, -50%)";
  };

  joystick.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    joystickPointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    setJoystick(event);
  });

  joystick.addEventListener("pointermove", (event) => {
    if (event.pointerId !== joystickPointer) return;
    event.preventDefault();
    setJoystick(event);
  });

  joystick.addEventListener("pointerup", resetJoystick);
  joystick.addEventListener("pointercancel", resetJoystick);
  joystick.addEventListener("lostpointercapture", resetJoystick);
  joystick.addEventListener("contextmenu", (event) => event.preventDefault());
}

for (const button of document.querySelectorAll(".control")) {
  const key = button.dataset.key;
  const set = (value) => {
    keys[key] = value;
    if (key === "jump" && value) keys.jump = true;
  };
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    set(true);
  });
  button.addEventListener("pointerup", () => set(false));
  button.addEventListener("pointercancel", () => set(false));
  button.addEventListener("pointerleave", () => set(false));
}

for (const eventName of ["pointerdown", "touchstart", "mousedown", "click"]) {
  document.addEventListener(eventName, startFromOverlay, { capture: true, passive: false });
  overlay.addEventListener(eventName, startFromOverlay, { passive: false });
  startButton.addEventListener(eventName, startGame, { passive: false });
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + w - radius, y);
    this.quadraticCurveTo(x + w, y, x + w, y + radius);
    this.lineTo(x + w, y + h - radius);
    this.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    this.lineTo(x + radius, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
  };
}

resetLevel(false);
render();
requestAnimationFrame(loop);
