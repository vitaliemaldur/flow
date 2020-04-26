import Url from 'url-parse';

class BlockEngine {
  constructor() {
    this.blacklist = new Set();
    this.redirectUrl = browser.runtime.getURL('blocked-page.html');
  }

  redirectListener = () => ({
    redirectUrl: this.redirectUrl,
  })

  async init() {
    const result = await browser.storage.local.get('blacklist');
    this.blacklist = new Set(result.blacklist) || this.blacklist;
    await this.applyBlacklist();
  }

  async applyBlacklist() {
    if (this.blacklist.size === 0) {
      return;
    }

    const patterns = [];
    this.blacklist.forEach((hostname) => {
      patterns.push(`*://${hostname}/*`);
      patterns.push(`*://m.${hostname}/*`);
      patterns.push(`*://www.${hostname}/*`);
    });

    // apply to all tabs
    const tabs = await browser.tabs.query({ url: patterns });
    tabs.forEach((tab) => (
      browser.tabs.update(tab.id, { url: this.redirectUrl })
    ));

    // block navigation to websites
    browser.webRequest.onBeforeRequest.removeListener(this.redirectListener);
    browser.webRequest.onBeforeRequest.addListener(
      this.redirectListener,
      { urls: patterns, types: ['main_frame'] },
      ['blocking'],
    );
  }

  async blockWebsite(url) {
    const parsedUrl = new Url(url);
    // save new url
    this.blacklist.add(parsedUrl.hostname);
    await browser.storage.local.set({ blacklist: Array.from(this.blacklist) });
    // update listeners
    await this.applyBlacklist();
  }
}

const engine = new BlockEngine();
engine.init().then(() => {
  console.log('Engine init finished!!!');
});


browser.runtime.onMessage.addListener(
  (data) => {
    if (data.type === 'blacklist.add') {
      engine.blockWebsite(data.params);
    }
    return Promise.resolve('ok');
  },
);
