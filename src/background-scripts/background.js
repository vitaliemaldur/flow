import Url from 'url-parse';

class BlockEngine {
  constructor() {
    this.blacklist = ['facebook.com', 'sport.ro'];
    this.redirectUrl = 'https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif';
  }

  redirectListener = () => ({
    redirectUrl: this.redirectUrl,
  })

  async init() {
    const result = await browser.storage.local.get('blacklist');
    this.blacklist = result.blacklist || this.blacklist;
    await this.applyBlacklist();
  }

  async applyBlacklist() {
    if (this.blacklist.length === 0) {
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
    this.blacklist.append(parsedUrl.hostname);
    await browser.storage.local.set('blacklist', this.blacklist);
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
      return Promise.resolve('done');
    }
    return Promise.resolve('ok');
  },
);
