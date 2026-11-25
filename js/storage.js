const RogueStorage = {
  KEY: 'shadow_kage_rogue_records_v1',

  loadAll() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveMissionResult(levelId, timeMs, alertsTriggered, takedowns) {
    const records = this.loadAll();
    const rating = alertsTriggered === 0 && takedowns === 0
      ? 'Sombra Fantasma'
      : alertsTriggered === 0
        ? 'Asesino Silencioso'
        : 'Agresivo';

    const prev = records[levelId];
    const bestTimeMs = prev && typeof prev.bestTimeMs === 'number'
      ? Math.min(prev.bestTimeMs, timeMs)
      : timeMs;

    records[levelId] = {
      levelId,
      rating,
      bestTimeMs,
      lastTimeMs: timeMs,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(this.KEY, JSON.stringify(records));
    } catch {
      // Ignorar errores de almacenamiento
    }
    return records[levelId];
  }
};
