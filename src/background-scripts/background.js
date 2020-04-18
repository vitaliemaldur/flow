browser.runtime.onInstalled.addListener(async () => {
  const tabs = await browser.tabs.query({ url: ['*://*.sport.ro/*'] });
  for (let i = 0; i < tabs.length; i += 1) {
    browser.tabs.update(tabs[i].id, { url: 'https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif' });
  }
});


browser.webRequest.onBeforeRequest.addListener(() => ({
  redirectUrl: 'https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif',
}), { urls: ['*://*.facebook.com/*'], types: ['main_frame'] }, ['blocking']);
