/*
 * TODO
 */
module.exports = class ZoneCache {
  constructor() {
    this.cache = new Map();
  }

  async fetch(zone) {
    return this.cache.get(zone);
  }

  async store(zone, json) {
    const value = this.cache.get(zone);
    if (value) {
      this.cache.set(zone, { ...value, ...json });
    } else {
      this.cache.set(zone, json);
    }
  }

  getMap() {
    return this.cache;
  }
};
