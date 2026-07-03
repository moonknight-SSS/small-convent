const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startButton = document.getElementById("startButton");
const coinCount = document.getElementById("coinCount");
const lifeCount = document.getElementById("lifeCount");
const timeCount = document.getElementById("timeCount");

const keys = {
  left: false,
  right: false,
  jump: false
};

const level = {
  width: 4380,
  height: 540,
  startX: 96,
  startY: 360,
  flagX: 4170,
  solids: [
    { x: 0, y: 472, w: 780, h: 68, type: "ground" },
    { x: 900, y: 472, w: 700, h: 68, type: "ground" },
    { x: 1720, y: 472, w: 840, h: 68, type: "ground" },
    { x: 2700, y: 472, w: 650, h: 68, type: "ground" },
    { x: 3480, y: 472, w: 900, h: 68, type: "ground" },
    { x: 310, y: 372, w: 180, h: 28, type: "platform" },
    { x: 650, y: 302, w: 170, h: 28, type: "platform" },
    { x: 1060, y: 372, w: 220, h: 28, type: "platform" },
    { x: 1438, y: 286, w: 160, h: 28, type: "platform" },
    { x: 1880, y: 360, w: 170, h: 28, type: "platform" },
    { x: 2200, y: 294, w: 250, h: 28, type: "platform" },
    { x: 2940, y: 378, w: 190, h: 28, type: "platform" },
    { x: 3230, y: 310, w: 160, h: 28, type: "platform" },
    { x: 3620, y: 410, w: 90, h: 62, type: "pipe" },
    { x: 3800, y: 356, w: 116, h: 116, type: "pipe" },
    { x: 540, y: 214, w: 44, h: 44, type: "question", hit: false },
    { x: 1360, y: 220, w: 44, h: 44, type: "question", hit: false },
    { x: 2020, y: 238, w: 44, h: 44, type: "question", hit: false },
    { x: 2580, y: 250, w: 44, h: 44, type: "brick" },
    { x: 2624, y: 250, w: 44, h: 44, type: "brick" },
    { x: 2668, y: 250, w: 44, h: 44, type: "question", hit: false }
  ],
  coins: [
    { x: 356, y: 330 }, { x: 414, y: 330 }, { x: 704, y: 260 },
    { x: 1110, y: 330 }, { x: 1170, y: 330 }, { x: 1488, y: 244 },
    { x: 1930, y: 318 }, { x: 2250, y: 252 }, { x: 2310, y: 252 },
    { x: 2370, y: 252 }, { x: 3000, y: 336 }, { x: 3278, y: 268 },
    { x: 3520, y: 430 }, { x: 3580, y: 430 }, { x: 3990, y: 430 }
  ],
  enemies: [
    { x: 610, y: 430, w: 38, h: 34, vx: -0.75, min: 115, max: 745, dead: false },
    { x: 1210, y: 430, w: 38, h: 34, vx: -0.9, min: 930, max: 1540, dead: false },
    { x: 2140, y: 430, w: 38, h: 34, vx: 0.85, min: 1740, max: 2500, dead: false },
    { x: 3070, y: 430, w: 38, h: 34, vx: -0.95, min: 2720, max: 3330, dead: false },
    { x: 3710, y: 430, w: 38, h: 34, vx: 0.9, min: 3500, max: 4100, dead: false }
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
  jumpGrace: 0
};

let cameraX = 0;
let state = "ready";
let lastTime = 0;
let timeLeft = 180;
let levelElapsed = 0;
let particles = [];
let audioContext = null;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(320, Math.floor(rect.width * ratio));
  canvas.height = Math.max(240, Math.floor(rect.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

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

function startGame() {
  resetLevel(false);
  state = "playing";
  overlay.classList.add("hidden");
  playTone(440, 0.08, "square", 0.05);
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

function updatePlayer() {
  const accel = player.onGround ? 0.78 : 0.44;
  const friction = player.onGround ? 0.78 : 0.96;
  const maxSpeed = 5.2;

  if (keys.left) {
    player.vx -= accel;
    player.facing = -1;
  }
  if (keys.right) {
    player.vx += accel;
    player.facing = 1;
  }
  if (!keys.left && !keys.right) {
    player.vx *= friction;
  }

  player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));
  player.vy += 0.72;
  player.vy = Math.min(player.vy, 15);

  if (player.onGround) player.jumpGrace = 8;
  else player.jumpGrace = Math.max(0, player.jumpGrace - 1);

  if (keys.jump && player.jumpGrace > 0) {
    player.vy = -13.2;
    player.onGround = false;
    player.jumpGrace = 0;
    keys.jump = false;
    spawnParticles(player.x + player.w / 2, player.y + player.h, "#ffffff", 8);
    playTone(520, 0.08, "square", 0.035);
  }

  moveWithCollisions(player, level.solids);

  player.x = Math.max(0, Math.min(level.width - player.w, player.x));
  if (player.y > level.height + 120) damagePlayer();
  if (player.invincible > 0) player.invincible -= 1;
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
  updatePlayer();
  updateEnemies();
  updateCoins();
  updateParticles();

  levelElapsed += dt;
  timeLeft = 180 - levelElapsed;
  if (timeLeft <= 0) damagePlayer();

  const viewW = canvas.clientWidth;
  cameraX = Math.max(0, Math.min(level.width - viewW, player.x - viewW * 0.42));

  if (player.x + player.w >= level.flagX) {
    state = "win";
    player.coins += Math.max(0, Math.ceil(timeLeft / 5));
    updateHud();
    showOverlay("通关成功", `最终金币：${player.coins}。这位戴眼镜耳机的主角已经抵达终点！`, "再玩一次");
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
  drawBackground(viewW, viewH);

  ctx.save();
  ctx.translate(-cameraX, 0);
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

startButton.addEventListener("click", startGame);

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
