const Levels = {
  data: [
    {
      id: 1,
      name: 'Patio Exterior',
      routes: ['Patio central', 'Sombra lateral'],
      exit: { x: 880, y: 80 },
      containers: [{ x: 260, y: 140 }, { x: 640, y: 480 }],
      guards: [{ x: 420, y: 300, angle: 0, patrol: [{ x: 420, y: 300 }, { x: 620, y: 300 }] }]
    },
    {
      id: 2,
      name: 'Conductos del Ala Norte',
      routes: ['Conducto de ventilación', 'Pasillo de guardia'],
      exit: { x: 890, y: 540 },
      containers: [{ x: 180, y: 460 }, { x: 520, y: 160 }],
      guards: [
        { x: 350, y: 200, angle: 0, patrol: [{ x: 350, y: 200 }, { x: 350, y: 460 }] },
        { x: 680, y: 320, angle: Math.PI, patrol: [{ x: 680, y: 320 }, { x: 520, y: 320 }] }
      ]
    },
    {
      id: 3,
      name: 'Vigas del Dojo',
      routes: ['Vigas superiores', 'Suelo del tatami'],
      exit: { x: 860, y: 320 },
      containers: [{ x: 300, y: 120 }, { x: 700, y: 500 }],
      guards: [
        { x: 320, y: 320, angle: 0, patrol: [{ x: 320, y: 320 }, { x: 560, y: 320 }] },
        { x: 600, y: 180, angle: Math.PI / 2, patrol: [{ x: 600, y: 180 }, { x: 600, y: 460 }] }
      ]
    },
    {
      id: 4,
      name: 'Jardín de los Faroles',
      routes: ['Setos en sombra', 'Puente iluminado'],
      exit: { x: 100, y: 80 },
      containers: [{ x: 480, y: 520 }, { x: 780, y: 180 }],
      guards: [
        { x: 260, y: 240, angle: 0, patrol: [{ x: 260, y: 240 }, { x: 480, y: 240 }] },
        { x: 520, y: 420, angle: Math.PI, patrol: [{ x: 520, y: 420 }, { x: 240, y: 420 }] },
        { x: 740, y: 300, angle: -Math.PI / 2, patrol: [{ x: 740, y: 300 }, { x: 740, y: 120 }] }
      ]
    },
    {
      id: 5,
      name: 'Archivo Secreto',
      routes: ['Conducto superior', 'Galería de pergaminos'],
      exit: { x: 880, y: 100 },
      containers: [{ x: 220, y: 160 }, { x: 580, y: 520 }],
      guards: [
        { x: 300, y: 360, angle: 0, patrol: [{ x: 300, y: 360 }, { x: 650, y: 360 }] },
        { x: 480, y: 160, angle: Math.PI / 2, patrol: [{ x: 480, y: 160 }, { x: 480, y: 500 }] },
        { x: 760, y: 240, angle: Math.PI, patrol: [{ x: 760, y: 240 }, { x: 620, y: 240 }] }
      ]
    },
    {
      id: 6,
      name: 'Cámara del Shogun',
      routes: ['Vigas del techo', 'Patio interior', 'Conducto real'],
      exit: { x: 900, y: 320 },
      containers: [{ x: 200, y: 140 }, { x: 500, y: 140 }, { x: 740, y: 500 }],
      guards: [
        { x: 280, y: 220, angle: 0, patrol: [{ x: 280, y: 220 }, { x: 280, y: 480 }] },
        { x: 520, y: 480, angle: -Math.PI / 2, patrol: [{ x: 520, y: 480 }, { x: 520, y: 200 }] },
        { x: 720, y: 220, angle: Math.PI / 2, patrol: [{ x: 720, y: 220 }, { x: 720, y: 460 }] },
        { x: 820, y: 320, angle: Math.PI, patrol: [{ x: 820, y: 320 }, { x: 640, y: 320 }] }
      ]
    }
  ],

  getLevel(levelNumber) {
    return this.data[(levelNumber - 1) % this.data.length];
  }
};
