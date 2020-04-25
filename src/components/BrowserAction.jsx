import { h, Component } from 'preact';

export default class BrowserAction extends Component {
  blockWebsite = async () => {
    const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    if (tabs.length === 0) {
      return;
    }
    const response = await browser.runtime.sendMessage({
      type: 'blacklist.add',
      params: tabs[0].url,
    });

    console.log('blockWebsite', tabs[0].url, response);
  };

  render() {
    return (
      <div id="app-root" style={{ width: 250, height: 400 }}>
        <h1>Flow</h1>
        <div>
          <button type="button" onClick={this.blockWebsite}>
            Block current website
          </button>
        </div>
        <div>
          <button type="button">Activate deep work</button>
        </div>
        <div>
          <button type="button">Stop deep work</button>
        </div>
        <div>
          <button type="button" onClick={() => browser.runtime.openOptionsPage()}>Settings</button>
        </div>
      </div>
    );
  }
}
