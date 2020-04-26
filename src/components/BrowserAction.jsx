import { h, Component, Fragment } from 'preact';
import Url from 'url-parse';

export default class BrowserAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      currentUrl: null,
      blacklist: [],
    };
  }

  async componentDidMount() {
    const result = await browser.storage.local.get('blacklist');
    const tabs = await browser.tabs.query({ active: true });
    this.setState({
      initialized: true,
      currentUrl: tabs.length === 1 ? tabs[0].url : null,
      blacklist: result.blacklist || [],
    });

    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.blacklist) {
        this.setState({ blacklist: changes.blacklist.newValue });
      }
    });
  }

  blockWebsite = async () => {
    const tabs = await browser.tabs.query({ active: true });
    if (tabs.length === 0) {
      return;
    }

    browser.runtime.sendMessage({
      type: 'blacklist.add',
      params: tabs[0].url,
    });
  };

  render() {
    const { initialized, currentUrl, blacklist } = this.state;

    let content = (
      <Fragment>
        <div>Loading</div>
      </Fragment>
    );

    let isBlocked = false;
    if (initialized) {
      const url = new Url(currentUrl);
      isBlocked = blacklist.indexOf(url.hostname) > -1;
      content = (
        <Fragment>
          <div>
            <button type="button" onClick={this.blockWebsite}>
              { !isBlocked ? 'Block website' : 'Unblock website' }
            </button>
          </div>
          <div>
            <a href={browser.runtime.getURL('options.html')} target="_blank" rel="noopener noreferrer">
              Settings
            </a>
          </div>
        </Fragment>
      );
    }

    return (
      <div id="app-root" style={{ width: 250, height: 400 }}>
        <h1>Flow</h1>
        { content }
      </div>
    );
  }
}
