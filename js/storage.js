const Store = {
  PREFIX: 'zenith_',
  get(key) { try { return JSON.parse(localStorage.getItem(this.PREFIX + key)) || []; } catch { return []; } },
  set(key, data) { localStorage.setItem(this.PREFIX + key, JSON.stringify(data)); },
  getObject(key, defaultVal = {}) { try { return JSON.parse(localStorage.getItem(this.PREFIX + key)) || defaultVal; } catch { return defaultVal; } },
  setObject(key, data) { localStorage.setItem(this.PREFIX + key, JSON.stringify(data)); },
  genId(prefix) { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5); },
  getProfile() {
    return this.getObject('profile', { name: 'User', avatar: '', mainGoal: '', studyTarget: 4, satTarget: 1500, preferredStudyTime: 'morning', xp: 0, level: 1 });
  },
  getStreaks() {
    return this.getObject('streaks', { daily: { current: 0, best: 0, lastDate: '' }, study: { current: 0, best: 0, lastDate: '' }, reading: { current: 0, best: 0, lastDate: '' }, goal: { current: 0, best: 0, lastDate: '' } });
  },
  getSettings() { return this.getObject('settings', { darkMode: false }); },
  addXP(amount) {
    const profile = this.getProfile();
    profile.xp += amount;
    while (profile.xp >= profile.level * 200) { profile.xp -= profile.level * 200; profile.level++; }
    this.setObject('profile', profile);
    return profile;
  },
  updateStreak(type) {
    const streaks = this.getStreaks(); const today = new Date().toISOString().split('T')[0]; const streak = streaks[type];
    if (!streak) return streaks; if (streak.lastDate === today) return streaks;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (streak.lastDate === yesterday) { streak.current++; } else { streak.current = 1; }
    streak.lastDate = today; if (streak.current > streak.best) streak.best = streak.current;
    this.setObject('streaks', streaks); return streaks;
  },
  exportData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key.startsWith(this.PREFIX)) { data[key] = localStorage.getItem(key); } }
    return JSON.stringify(data, null, 2);
  },
  clearAll() {
    const keys = []; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key.startsWith(this.PREFIX)) keys.push(key); }
    keys.forEach(k => localStorage.removeItem(k));
  }
};
