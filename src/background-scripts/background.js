import Blacklist from './Blacklist';

class BlockEngine {
  constructor() {
    this.blacklist = new Blacklist();
    this.pageMap = new Map();
    this.redirectUrl = browser.runtime.getURL('blocked-page.html');
  }

  redirectListener = (details) => {
    if (this.blacklist.isBlocked(details.url)) {
      this.pageMap.set(details.tabId, { initialURL: details.url });
      return {
        redirectUrl: `${this.redirectUrl}?url=${window.btoa(details.url)}`,
      };
    }

    return {};
  };

  async init() {
    await this.blacklist.init(this.updateAllTabs);
    await this.updateAllTabs();
    browser.webRequest.onBeforeRequest.addListener(
      this.redirectListener,
      { types: ['main_frame'], urls: ['<all_urls>'] },
      ['blocking'],
    );
    browser.tabs.onRemoved.addListener((tabId) => {
      this.pageMap.delete(tabId);
    });
  }

  updateAllTabs = async () => {
    const patterns = this.blacklist.allBlocked().map((host) => `*://${host}/*`);
    if (patterns.length > 0) {
      const tabs = await browser.tabs.query({
        url: patterns,
      });
      tabs.forEach((tab) => {
        this.pageMap.set(tab.id, { initialURL: tab.url });
        browser.tabs.update(tab.id, { url: `${this.redirectUrl}?url=${window.btoa(tab.url)}` });
      });
    }
  };

  restoreAllTabs = (host) => {
    this.pageMap.forEach((value, tabId) => {
      const parsedURL = new URL(value.initialURL);
      if (parsedURL.host === host) {
        browser.tabs.update(tabId, { url: value.initialURL });
      }
    });
  };

  async blacklistAdd(url) {
    await this.blacklist.add(url);
    await this.updateAllTabs();
  }

  async blacklistRemove(host) {
    await this.blacklist.remove(`http://${host}/`);
    this.restoreAllTabs();
  }

  async whitelistAdd(url, minutes) {
    await this.blacklist.pause(url, minutes);
    const parsedURL = new URL(url);
    this.restoreAllTabs(parsedURL.host);
  }
}

const engine = new BlockEngine();
engine.init().then(() => {
  console.log('Engine init finished!!!');
});


browser.runtime.onMessage.addListener(
  (data) => {
    try {
      switch (data.type) {
        case 'blacklist.add':
          engine.blacklistAdd(data.params);
          break;
        case 'blacklist.remove':
          engine.blacklistRemove(data.params);
          break;
        case 'whitelist.add':
          engine.whitelistAdd(...data.params);
          break;
        default:
          break;
      }
    } catch (e) {
      return Promise.resolve('error');
    }
    return Promise.resolve('ok');
  },
);
