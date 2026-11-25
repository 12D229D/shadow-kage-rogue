const Guards = {
  list: [],

  init: function() {
    // Create 3 patrol guards
    this.spawnGuard(240, 160, 'horizontal');
    this.spawnGuard(600, 400, 'vertical');
    this.spawnGuard(120, 400, 'horizontal');
  },

  spawnGuard: function(gridX, gridY, pattern) {
    const guard = {
      x: gridX,
      y: gridY,
      width: 20,
      height: 20,
      rotation: 0,
      state: 'patrol',
      visionRange: 180,
      visionAngle: Math.PI / 4,
      patrolPath: [],
      timer: 0,
      noiseThreshold: 40,
      targetPlayer: null,

      // Patrol patterns
      pathPatterns: {
        horizontal: [
          { x: 20, y: gridY },
          { x: 200, y: gridY },
          { x: 700, y: gridY },
          { x: 940, y: gridY }
        ],
        vertical: [
          { x: gridX, y: 20 },
          { x: gridX, y: 200 },
          { x: gridX, y: 400 },
          { x: gridX, y: 600 }
        ]
      },

      setState: function(newState) {
        if (this.state !== newState) {
          this.state = newState;
          this.stateChangedAt = Date.now();
        }
      },

      update: function() {
        this.timer = Date.now() - this.stateChangedAt;
        
        switch (this.state) {
          case 'patrol':
            this.patrolBehavior();
            this.checkLineOfSight();
            break;
          
          case 'investigation':
            this.investigationBehavior();
            this.checkLineOfSight();
            break;
          
          case 'alert':
            this.alertBehavior();
            break;
        }
        
        this.updateVisionCone();
      },

      patrolBehavior: function() {
        const path = this.patrolPath;
        if (path.length === 0) {
          this.patrolPath = this.patterns[this.pattern];
        }
        
        const target = this.getNextPatrolPoint();
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        
        const dist = Math.hypot(dx, dy);
        
        if (dist < 2) {
          this.x = target.x;
          this.y = target.y;
          
          this.currentIndex = (this.currentIndex || 0) + 1;
          if (this.currentIndex >= path.length) {
            this.currentIndex = 0;
          }
          return;
        }
        
        this.x += (dx / dist) * 2;
        this.y += (dy / dist) * 2;
        
        // Calculate rotation towards next point
        this.rotation = Math.atan2(dy, dx);
      },

      getNextPatrolPoint: function() {
        const path = this.patrolPath || this.patterns[this.pattern];
        if (!path || path.length === 0) return { x: this.x, y: this.y };
        
        const idx = (this.currentIndex || 0) % path.length;
        return path[idx];
      },

      investigationBehavior: function() {
        // Search for player after noise or sighting
        if (this.targetPlayer) {
          const dx = this.targetPlayer.x - this.x;
          const dy = this.targetPlayer.y - this.y;
          const dist = Math.hypot(dx, dy);
          
          this.x += (dx / dist) * 3;
          this.y += (dy / dist) * 3;
          
          if (dist < 30) {
            this.setState('alert');
            this.targetPlayer = null;
          }
        } else {
          // Reset to patrol after investigation period
          if (this.timer > 5000) {
            this.setState('patrol');
          }
        }
      },

      alertBehavior: function() {
        // Chase player and call reinforcements
        if (this.targetPlayer) {
          const dx = this.targetPlayer.x - this.x;
          const dy = this.targetPlayer.y - this.y;
          const dist = Math.hypot(dx, dy);
          
          this.x += (dx / dist) * 5;
          this.y += (dy / dist) * 5;
          
          // Attack if close enough
          if (dist < 40) {
            Player.stealthLevel = 0;
          }
        }
        
        // Auto-reset after alert period
        if (this.timer > 8000) {
          this.setState('patrol');
          this.targetPlayer = null;
        }
      },

      checkLineOfSight: function() {
        const dx = Player.x - this.x;
        const dy = Player.y - this.y;
        const distToPlayer = Math.hypot(dx, dy);
        
        // Check if player is within vision range and angle
        if (distToPlayer < this.visionRange) {
          const playerAngle = Math.atan2(dy, dx);
          const angleDiff = Math.abs(Math.abs(playerAngle - this.rotation) - Math.PI);
          
          if (angleDiff < this.visionAngle / 2) {
            // Check for walls between guard and player
            const wallPos = Raycast.findFirstWallDist(
              Math.floor(this.x), Math.floor(this.y), playerAngle
            );
            
            if (!wallPos || wallPos > distToPlayer - 20) {
              // Player is visible
              this.setState('alert');
            }
          }
        }
      },

      updateVisionCone: function() {
        // Calculate cone vertices based on guard state
        // State colors: green=patrol, yellow=investigation, red=alert
        const colors = {
          patrol: 'hsla(140, 40%, 45%, 0.15)',
          investigation: 'hsla(45, 90%, 55%, 0.2)',
          alert: 'hsla(0, 100%, 50%, 0.3)'
        };
        
        // Just store the cone color for rendering in app.js
        this.currentConeColor = colors[this.state];
      }
    };
    
    guard.pattern = pattern;
    guard.patrolPath = guard.pathPatterns[pattern];
    guard.currentIndex = 0;
    
    this.list.push(guard);
  },

  update: function() {
    this.list.forEach(guard => guard.update());
  },

  checkAlert: function() {
    return this.list.some(g => g.state === 'alert');
  }
};

window.Guards = Guards;