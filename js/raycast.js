const Raycast = {
  width: 960,
  height: 640,
  player: null,
  guards: [],
  canvas: null,
  ctx: null,

  init: function(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);
    
    this.lights = [{
      x: centerX,
      y: centerY,
      radius: 180,
      intensity: 0.8
    }];
  },

  castRays: function() {
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);
    
    this.ctx.save();
    
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const dist = Math.hypot(x - centerX, y - centerY);
        if (dist > this.lights[0].radius) continue;
        
        const angle = Math.atan2(y - centerY, x - centerX);
        const distToWall = this.findFirstWallDist(x, y, angle);
        const distFromPlayer = dist;
        
        if (distToWall === null || distToWall < distFromPlayer) {
          const brightness = 1 - (distToWall / this.lights[0].radius);
          const color = `hsl(240, ${20 + Math.floor(brightness * 20)}%, ${15 + Math.floor(brightness * 15)}%)`;
          this.ctx.fillStyle = color;
          this.ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  },

  findFirstWallDist: function(x, y, angle) {
    const step = 4;
    const maxDist = 100;
    
    for (let dist = 0; dist < maxDist; dist += step) {
      const testX = Math.floor(x + Math.cos(angle) * dist);
      const testY = Math.floor(y + Math.sin(angle) * dist);
      
      if (testX < 0 || testX >= this.width || testY < 0 || testY >= this.height) return null;
      
      if (this.isWall(testX, testY)) {
        return dist;
      }
    }
    return null;
  },

  isWall: function(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    
    const col = Math.floor(x / 40);
    const row = Math.floor(y / 40);
    
    const wallTiles = [
      [2, 2], [2, 3], [2, 4], [2, 5], [2, 6],
      [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
      [2, 7], [2, 8], [6, 7], [6, 8], [3, 8], [4, 8], [5, 8]
    ];
    
    return wallTiles.some(tile => tile[0] === row && tile[1] === col);
  },

  drawGuardVision: function(guard) {
    if (guard.state !== 'alert') return;
    
    this.ctx.save();
    this.ctx.strokeStyle = `hsla(0, 100%, 50%, 0.3)`;
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.5;
    
    const coneAngle = Math.PI / 4;
    this.ctx.beginPath();
    this.ctx.moveTo(guard.x, guard.y);
    
    for (let angle = -coneAngle; angle <= coneAngle; angle += 0.05) {
      const endX = guard.x + Math.cos(guard.rotation + angle) * guard.visionRange;
      const endY = guard.y + Math.sin(guard.rotation + angle) * guard.visionRange;
      this.ctx.lineTo(endX, endY);
    }
    
    this.ctx.closePath();
    this.ctx.fillStyle = `hsla(0, 100%, 50%, 0.1)`;
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }
};

window.Raycast = Raycast;