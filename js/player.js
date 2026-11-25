const Player = {
  x: 120,
  y: 120,
  width: 20,
  height: 20,
  rotation: 0,
  speed: 2.5,
  stealthLevel: 100,
  noiseLevel: 0,
  health: 100,
  maxHealth: 100,
  inventory: {
    shuriken: { count: 5, cooldown: 0, maxCooldown: 2000 },
    smoke: { count: 2, cooldown: 0, maxCooldown: 3000 },
    grappling: { count: 1, active: false },
    decoy: { count: 3, cooldown: 0, maxCooldown: 1000 }
  },
  isRunning: false,
  lastMoveTime: Date.now(),

  update: function() {
    const keys = Input.keys;
    
    if (keys['w'] || keys['a'] || keys['s'] || keys['d']) {
      this.handleMovement();
      this.isRunning = true;
    } else {
      this.isRunning = false;
    }
    
    if (this.isRunning) {
      const elapsed = Date.now() - this.lastMoveTime;
      if (elapsed > 200) {
        this.addNoise(10);
        this.lastMoveTime = Date.now();
      }
    }
    
    this.updateStealthLevel();
    this.useGadgets();
    this.checkGameOver();
  },

  handleMovement: function() {
    let dx = 0, dy = 0;
    
    if (Input.keys['w']) dy -= this.speed;
    if (Input.keys['a']) dx -= this.speed;
    if (Input.keys['s']) dy += this.speed;
    if (Input.keys['d']) dx += this.speed;
    
    this.x += dx;
    this.y += dy;
    
    this.clampPosition();
  },

  clampPosition: function() {
    this.x = Math.max(20, Math.min(940, this.x));
    this.y = Math.max(20, Math.min(620, this.y));
  },

  addNoise: function(amount) {
    this.noiseLevel = Math.min(100, this.noiseLevel + amount);
  },

  useSmoke: function() {
    if (this.inventory.smoke.count > 0 && this.inventory.smoke.cooldown <= 0) {
      this.inventory.smoke.count--;
      this.inventory.smoke.cooldown = this.inventory.smoke.maxCooldown;
      return true;
    }
    return false;
  },

  useShuriken: function(targetX, targetY) {
    if (this.inventory.shuriken.count > 0 && this.inventory.shuriken.cooldown <= 0) {
      this.inventory.shuriken.count--;
      this.inventory.shuriken.cooldown = this.inventory.shuriken.maxCooldown;
      
      const angle = Math.atan2(targetY - this.y, targetX - this.x);
      return { x: this.x, y: this.y, angle: angle, damage: 25 };
    }
    return null;
  },

  useDecoy: function() {
    if (this.inventory.decoy.count > 0 && this.inventory.decoy.cooldown <= 0) {
      this.inventory.decoy.count--;
      this.inventory.decoy.cooldown = this.inventory.decoy.maxCooldown;
      
      return {
        x: this.x,
        y: this.y,
        active: true,
        effect: 'visual_decoy'
      };
    }
    return null;
  },

  useGadgets: function() {
    const now = Date.now();
    
    Object.keys(this.inventory).forEach(key => {
      const item = this.inventory[key];
      if (item.cooldown > 0) {
        item.cooldown = Math.max(0, item.cooldown - 16);
      }
    });
  },

  updateStealthLevel: function() {
    let baseStealth = 100;
    
    if (this.noiseLevel > 50) baseStealth -= 20;
    if (this.noiseLevel > 80) baseStealth -= 30;
    
    const isInShadow = this.checkIfInShadow();
    if (isInShadow) baseStealth += 10;
    
    this.stealthLevel = Math.max(0, Math.min(100, baseStealth));
  },

  checkIfInShadow: function() {
    const dist = Math.hypot(this.x - 480, this.y - 320);
    const angle = Math.atan2(this.y - 320, this.x - 480);
    
    const shadowCast = Raycast.findFirstWallDist(
      Math.floor(this.x), Math.floor(this.y), angle
    );
    
    return shadowCast && shadowCast < dist;
  },

  checkGameOver: function() {
    if (this.stealthLevel <= 0) {
      GameState.gameOver('¡Capturado! Has sido descubierto.');
    }
  }
};

window.Player = Player;