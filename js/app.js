const Input = {
  keys: {},
  
  init: function() {
    document.addEventListener('keydown', (e) => {
      Input.keys[e.key] = true;
      
      // Gadgets
      if (e.key === 'q' && Gadgets.smokeBomb.count > 0 && Gadgets.smokeBomb.active.length < 1) {
        Audio.playSmoke();
        Gadgets.smokeBomb.create(Player.x, Player.y);
      }
      if (e.key === 'e' && Gadgets.decoy.count > 0 && Gadgets.decoy.active.length < 1) {
        Audio.playDecoy();
        Gadgets.decoy.create(Player.x, Player.y);
      }
      if (e.key === '1') { Audio.playShuriken(); Gadgets.shuriken.create(Player.x, Player.y, Player.rotation); }
      if (e.key === '2' && Gadgets.shuriken.count > 0) { /* Shuriken */ }
      if (e.key === 'f' || e.key === 'F') {
        GameState.tryTakedownOrHide();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      Input.keys[e.key] = false;
    });
  },

  reset: function() {
    this.keys = {};
  },

  pollGamepad: function() {
    if (!navigator.getGamepads) return;
    const gp = navigator.getGamepads()[0];
    if (!gp) return;
    const deadzone = 0.25;
    this.keys['w'] = gp.axes[1] < -deadzone;
    this.keys['s'] = gp.axes[1] > deadzone;
    this.keys['a'] = gp.axes[0] < -deadzone;
    this.keys['d'] = gp.axes[0] > deadzone;
    if (gp.buttons[2] && gp.buttons[2].pressed) {
      GameState.tryTakedownOrHide();
    }
  }
};

Input.init();

const GameState = {
  isRunning: false,
  score: 0,
  level: 1,
  levelStartTime: 0,
  alertsTriggered: 0,
  takedowns: 0,
  bodies: [],
  currentLevelData: null,

  loadLevel: function(levelNum) {
    this.level = levelNum;
    this.levelStartTime = performance.now();
    this.alertsTriggered = 0;
    this.takedowns = 0;
    this.bodies = [];
    this.currentLevelData = typeof Levels !== 'undefined' ? Levels.getLevel(levelNum) : null;
    Player.x = 80;
    Player.y = 560;
    if (this.currentLevelData && typeof Guards !== 'undefined') {
      Guards.list = this.currentLevelData.guards.map((g) => ({
        ...g,
        state: 'patrol',
        patrolIndex: 0
      }));
    }
  },

  tryTakedownOrHide: function() {
    // 1. Ocultar cuerpo cercano en contenedor/sombra
    if (this.currentLevelData) {
      for (let i = this.bodies.length - 1; i >= 0; i--) {
        const body = this.bodies[i];
        const distPlayer = Math.hypot(Player.x - body.x, Player.y - body.y);
        if (distPlayer < 45) {
          const nearContainer = this.currentLevelData.containers.some(
            (c) => Math.hypot(c.x - Player.x, c.y - Player.y) < 70
          );
          if (nearContainer) {
            this.bodies.splice(i, 1);
            const msg = document.getElementById('message');
            if (msg) msg.textContent = 'Cuerpo ocultado en las sombras.';
            return;
          }
        }
      }
    }

    // 2. Eliminación silenciosa por la espalda
    for (let i = Guards.list.length - 1; i >= 0; i--) {
      const g = Guards.list[i];
      const dx = Player.x - g.x;
      const dy = Player.y - g.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 42) {
        const angleToPlayer = Math.atan2(dy, dx);
        const angleDiff = Math.abs(Math.atan2(Math.sin(angleToPlayer - g.angle), Math.cos(angleToPlayer - g.angle)));
        if (angleDiff > Math.PI * 0.55) {
          Guards.list.splice(i, 1);
          this.bodies.push({ x: g.x, y: g.y });
          this.takedowns++;
          const msg = document.getElementById('message');
          if (msg) msg.textContent = 'Eliminación silenciosa! Pulsa F cerca de un contenedor para ocultar el cuerpo.';
          return;
        }
      }
    }
  },

  start: function() {
    this.isRunning = true;
    Player.stealthLevel = 100;
    Player.noiseLevel = 0;
    this.loadLevel(this.level);
    Audio.playBackground();
    this.loop();
  },

  loop: function() {
    if (!GameState.isRunning) return;
    
    Input.pollGamepad();
    // Update all game systems
    Player.update();
    Guards.update();
    Gadgets.update();

    if (Guards.list.some((g) => g.state === 'alert')) {
      GameState.alertsTriggered++;
    }

    // Comprobar extracción de nivel
    if (GameState.currentLevelData) {
      const exit = GameState.currentLevelData.exit;
      if (Math.hypot(Player.x - exit.x, Player.y - exit.y) < 28) {
        const elapsed = Math.round(performance.now() - GameState.levelStartTime);
        if (typeof RogueStorage !== 'undefined') {
          const saved = RogueStorage.saveMissionResult(
            GameState.level,
            elapsed,
            GameState.alertsTriggered,
            GameState.takedowns
          );
          const msg = document.getElementById('message');
          if (msg) msg.textContent = `Nivel ${GameState.level} completado (${saved.rating}) - ${(elapsed / 1000).toFixed(1)}s`;
        }
        GameState.loadLevel(GameState.level + 1);
      }
    }
    
    // Clear and redraw
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Render raycast shadows
    Raycast.castRays();
    
    // Render vision cones
    Guards.list.forEach(g => Raycast.drawGuardVision(g));
    
    // Render gadgets
    Gadgets.render(ctx);
    
    // Render player
    ctx.fillStyle = Player.stealthLevel > 50 ? '#fff' : '#888';
    ctx.beginPath();
    ctx.arc(Player.x, Player.y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Render guards
    Guards.list.forEach(guard => {
      ctx.fillStyle = guard.state === 'patrol' ? '#8fbc8f' : 
                      guard.state === 'investigation' ? '#eab830' : 
                      '#d9534f';
      ctx.beginPath();
      ctx.arc(guard.x, guard.y, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Update HUD
    UI.updateHUD();
    
    requestAnimationFrame(GameState.loop);
  }
};

const UI = {
  updateHUD: function() {
    const stealthBar = document.getElementById('stealth-fill');
    const noiseBar = document.getElementById('noise-fill');
    
    if (stealthBar) {
      stealthBar.style.width = `${Player.stealthLevel}%`;
      stealthBar.style.backgroundPlayer = Player.stealthLevel > 50 ? 'hsl(140, 40%, 45%)' : 
        Player.stealthLevel > 20 ? 'hsl(45, 90%, 55%)' : 'hsl(0, 100%, 50%)';
    }
    
    if (noiseBar) {
      noiseBar.style.width = `${Player.noiseLevel}%`;
      noiseBar.style.background = Player.noiseLevel > 70 ? 'hsl(0, 100%, 55%)' :
        Player.noiseLevel > 40 ? 'hsl(45, 90%, 55%)' : 'hsl(140, 40%, 45%)';
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('game-canvas');
  Raycast.init(canvas);
  Guards.init();
  Gadgets.init();
  Audio.init();
  
  // Start game after canvas is ready
  const startBtn = document.createElement('button');
  startBtn.textContent = 'Iniciar Juego';
  startBtn.style.cssText = `
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    padding: 20px 40px; background: var(--accent); color: white; border: none;
    border-radius: 4px; font-family: 'Outfit', sans-serif; font-size: 1.2rem;
    cursor: pointer; opacity: 0; transition: opacity 0.3s;
  `;
  
  const msgBox = document.getElementById('message');
  msgBox.textContent = '¡Bienvenido a Shadow Kage Rogue!\n\nUsa WASD para moverte, Q para bomba de humo, E para señuelo, y 1 para shuriken.';
  msgBox.classList.add('visible');
  
  setTimeout(() => {
    document.body.removeChild(startBtn);
    msgBox.classList.remove('visible');
    GameState.start();
  }, 3000);
});