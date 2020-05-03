const DEFAULT_PAUSED_TIMESTAMP = 0;

export default class Blacklist {
  constructor() {
    this.blocked = new Map();
  }

  async init() {
    const result = await browser.storage.local.get(['blacklist']);
    if (result.blacklist) {
      this.blocked = new Map(Object.entries(result.blacklist));
    }
  }

  async syncStorage() {
    await browser.storage.local.set({ blacklist: Object.fromEntries(this.blocked) });
  }

  async add(url) {
    const parsedURL = new URL(url);
    if (!this.blocked.has(parsedURL.host)) {
      this.blocked.set(parsedURL.host, { paused: DEFAULT_PAUSED_TIMESTAMP });
      await this.syncStorage();
    }
  }

  async remove(url) {
    const parsedURL = new URL(url);
    if (this.blocked.has(parsedURL.host)) {
      this.blocked.delete(parsedURL.host);
      await this.syncStorage();
    }
  }

  async pause(url, minutes) {
    const parsedURL = new URL(url);
    if (this.blocked.has(parsedURL.host)) {
      const value = this.blocked.get(parsedURL.host);
      value.paused = Date.now() + minutes * 60 * 1000;
      this.blocked.set(parsedURL.host, value);
      await this.syncStorage();
    }
  }

  isBlocked(url) {
    const parsedURL = new URL(url);
    if (this.blocked.has(parsedURL.host)) {
      const value = this.blocked.get(parsedURL.host);
      return value.paused < Date.now();
    }
    return false;
  }

  allBlocked() {
    const timestamp = Date.now();
    return Array.from(this.blocked.keys()).filter(
      (host) => (this.blocked.get(host).paused < timestamp),
    );
  }
}
