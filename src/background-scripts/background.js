
class BlockEngine {
  constructor() {
    this.blacklist = new Set();
    this.pomodoroFinishTimestamp = Math.floor(Date.now() / 1000);
    this.redirectUrl = browser.runtime.getURL('blocked-page.html');
  }

  redirectListener = () => ({
    redirectUrl: this.redirectUrl,
  })

  async init() {
    const result = await browser.storage.local.get(['blacklist', 'pomodoro']);
    this.pomodoroFinishTimestamp = result.pomodoro || this.pomodoroFinishTimestamp;
    this.blacklist = new Set(result.blacklist) || this.blacklist;
    await this.startBlocking();
  }

  async startBlocking() {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp >= this.pomodoroFinishTimestamp) {
      return;
    }

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

    // remove listener after pomodoro is finished
    setTimeout(() => {
      browser.webRequest.onBeforeRequest.removeListener(this.redirectListener);
    }, (this.pomodoroFinishTimestamp - currentTimestamp) * 1000);
  }

  async startPomodoro(durationInMinutes) {
    this.pomodoroFinishTimestamp = Math.floor(Date.now() / 1000) + durationInMinutes * 60;
    await browser.storage.local.set({ pomodoro: this.pomodoroFinishTimestamp });
    await this.startBlocking();
  }

  async blockWebsite(url) {
    const parsedUrl = new URL(url);
    // save new url
    if (parsedUrl.hostname && parsedUrl.hostname.length > 0) {
      this.blacklist.add(parsedUrl.hostname);
      await browser.storage.local.set({ blacklist: Array.from(this.blacklist) });
    } else {
      throw new Error('Invalid URL');
    }
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
          engine.blockWebsite(data.params);
          break;
        case 'pomodoro.set':
          engine.startPomodoro(data.params);
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
