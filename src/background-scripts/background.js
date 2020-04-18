browser.runtime.onInstalled.addListener(async function() {
  console.log("Extension installed!!!!!!!");

  const tabs = await browser.tabs.query({url: ['*://*.sport.ro/*']});
  console.log(tabs);
  for (const tab of tabs) {
    await browser.tabs.update(tab.id, {url: "https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif"})
  }
});


browser.webRequest.onBeforeRequest.addListener((details) => {
  console.log(details);
  return {
    redirectUrl: "https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif"
  };
}, {urls: ['*://*.facebook.com/*'], types: ['main_frame']}, ['blocking']);