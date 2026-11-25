const Gadgets = {
  activeEffects: [],

  init: function() {
    this.activeEffects = [];
  },

  shuriken: {
    active: [],
    
    create: function(x, y, angle) {
      return {
        x: x,
        y: y,
        angle: angle,
        vx: Math.cos(angle) * 8,
        vy: Math.sin(angle) * 8,
        damage: 25,
        life: 30,
        update: function() {
          this.x += this.vx;
          this.y += this.vy;
          this.life--;
          
          // Check wall collision
          if (Raycast.isWall(Math.floor(this.x), Math.floor(this.y))) {
            this.life = 0;
          }
        },
        render: function(ctx) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + 12 * Math.cos(this.angle), this.y + 12 * Math.sin(this.angle));
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      };
    },

    update: function() {
      this.active = this.active.filter(shuriken => shuriken.life > 0);
      this.active.forEach(s => s.update());
    },

    render: function(ctx) {
      this.active.forEach(s => s.render(ctx));
    }
  },

  smokeBomb: {
    active: [],
    
    create: function(x, y) {
      return {
        x: x,
        y: y,
        radius: 40,
        duration: 180,
        elapsed: 0,
        update: function() {
          this.elapsed++;
        },
        render: function(ctx) {
          const alpha = this.duration > this.elapsed ? 0.6 : 0.3;
          ctx.fillStyle = `hsla(240, 50%, 60%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      };
    },

    update: function() {
      this.active = this.active.filter(bomb => bomb.duration > bomb.elapsed);
      this.active.forEach(b => b.update());
    },

    render: function(ctx) {
      this.active.forEach(b => b.render(ctx));
    }
  },

  decoy: {
    active: [],
    
    create: function(x, y) {
      return {
        x: x,
        y: y,
        radius: 15,
        duration: 120,
        elapsed: 0,
        updatesGuardTargets: false,
        update: function() {
          this.elapsed++;
          // Draw visual decoy effect
          if (this.elapsed > 30 && this.elapsed < 90) {
            this.visible = true;
          } else {
            this.visible = false;
          }
        },
        render: function(ctx) {
          if (!this.visible) return;
          
          ctx.fillStyle = 'hsla(0, 0%, 100%, 0.3)';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw ninja silhouette
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      };
    },

    update: function() {
      this.active = this.active.filter(d => d.duration > d.elapsed);
      this.active.forEach(d => d.update());
    },

    render: function(ctx) {
      this.active.forEach(d => d.render(ctx));
    }
  },

  update: function() {
    this.shuriken.update();
    this.smokeBomb.update();
    this.decoy.update();
  },

  render: function(ctx) {
    this.shuriken.render(ctx);
    this.smokeBomb.render(ctx);
    this.decoy.render(ctx);
  },

  getActiveEffects: function() {
    const effects = [];
    
    this.smokeBomb.active.forEach(() => {
      effects.push({ type: 'smoke', duration: 60 });
    });
    
    return effects;
  }
};

window.Gadgets = Gadgets;