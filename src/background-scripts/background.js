import Blacklist from './Blacklist';

class BlockEngine {
  constructor() {
    this.blacklist = new Blacklist();
    this.redirectUrl = browser.runtime.getURL('blocked-page.html');
  }

  redirectListener = (details) => {
    if (this.blacklist.isBlocked(details.url)) {
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
  }

  updateAllTabs = async () => {
    const patterns = this.blacklist.allBlocked().map((host) => `*://${host}/*`);
    if (patterns.length > 0) {
      const tabs = await browser.tabs.query({
        url: patterns,
      });
      tabs.forEach((tab) => {
        browser.tabs.update(tab.id, {
          url: `${this.redirectUrl}?url=${window.btoa(tab.url)}`,
        });
      });
    }
  };

  restoreAllTabs = async (host) => {
    const tabs = await browser.tabs.query({});

    tabs.filter(
      (tab) => tab.url.startsWith(this.redirectUrl),
    ).forEach((tab) => {
      const parsedURL = new URL(tab.url);
      const url = window.atob(parsedURL.searchParams.get('url'));
      const parsedBlockedURL = new URL(url);
      if (parsedBlockedURL.host === host) {
        browser.tabs.update(tab.id, { url });
      }
    });
  };

  async blacklistAdd(url) {
    await this.blacklist.add(url);
    await this.updateAllTabs();
  }

  async blacklistRemove(host) {
    await this.blacklist.remove(`http://${host}/`);
    await this.restoreAllTabs(host);
  }

  async whitelistAdd(url, minutes) {
    await this.blacklist.pause(url, minutes);
    const parsedURL = new URL(url);
    await this.restoreAllTabs(parsedURL.host);
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
