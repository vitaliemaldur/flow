import { h, Component, Fragment } from 'preact';
import addDocument from '../assets/images/add-document.png';
import readingTime from '../assets/images/reading-time.png';
import SettingsIcon from '../assets/images/settings-icon.svg';

export default class BrowserAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      blacklist: {},
      currentURL: null,
    };
  }

  async componentDidMount() {
    const [tabs, storageResult] = await Promise.all([
      browser.tabs.query({ active: true }),
      browser.storage.local.get('blacklist'),
    ]);

    this.setState({
      initialized: true,
      blacklist: storageResult.blacklist || {},
      currentURL: tabs.length > 0 ? tabs[0].url : null,
    });

    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.blacklist) {
        this.setState({ blacklist: changes.blacklist.newValue });
      }
    });
  }

  blacklistAdd = async () => {
    const { currentURL } = this.state;
    // TODO: validate URL
    browser.runtime.sendMessage({
      type: 'blacklist.add',
      params: currentURL,
    });
  };

  blacklistRemove = async () => {
    const { currentURL } = this.state;
    // TODO: validate URL
    const parsedURL = new URL(currentURL);
    browser.runtime.sendMessage({
      type: 'blacklist.remove',
      params: parsedURL.host,
    });
  };

  render() {
    const { initialized, currentURL, blacklist } = this.state;
    if (!initialized) {
      return 'Loading';
    }

    const parsedURL = new URL(currentURL);
    const isBlocked = Object.prototype.hasOwnProperty.call(blacklist, parsedURL.host);

    return (
      <div style={{ width: 250, height: 280 }}>
        <nav className="navbar navbar-dark bg-dark">
          <span className="navbar-brand mb-0 h1">Flow</span>
          <ul className="navbar-nav">
            <li className="nav-item">
              <a
                className="nav-link"
                href={browser.runtime.getURL('options.html')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SettingsIcon />
              </a>
            </li>
          </ul>
        </nav>
        <main className="container">
          {
            !isBlocked && (
              <Fragment>
                <img src={addDocument} className="img-fluid" alt="Website placeholder" />
                <button type="button" onClick={this.blacklistAdd} className="btn btn-primary btn-block">
                  Add to blacklist
                </button>
              </Fragment>
            )
          }
          {
            isBlocked && (
              <Fragment>
                <img src={readingTime} className="img-fluid" alt="Website placeholder" />
                <button type="button" onClick={this.blacklistRemove} className="btn btn-danger btn-block">
                  Remove from blacklist
                </button>
              </Fragment>
            )
          }
        </main>
      </div>
    );
  }
}
