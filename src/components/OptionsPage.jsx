import { h, Component, Fragment } from 'preact';

export default class BrowserAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      blacklist: {},
    };
  }

  async componentDidMount() {
    const result = await browser.storage.local.get('blacklist');
    this.setState({
      initialized: true,
      blacklist: result.blacklist || {},
    });

    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.blacklist) {
        this.setState({ blacklist: changes.blacklist.newValue });
      }
    });
  }

  removeFromBlacklist = (hostname) => {
    browser.runtime.sendMessage({
      type: 'blacklist.remove',
      params: hostname,
    });
  };

  render() {
    const { initialized, blacklist } = this.state;
    let content = (
      <Fragment>
        <div>Loading</div>
      </Fragment>
    );

    if (initialized) {
      content = (
        <Fragment>
          <h3 className="text-center">Blacklist</h3>
          <ul className="list-group">
            { Object.keys(blacklist).map((hostname) => (
              <li className="list-group-item">
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => { this.removeFromBlacklist(hostname); }}
                >
                  delete
                </button>
                <span className="ml-1">{hostname}</span>
              </li>
            )) }
          </ul>
        </Fragment>
      );
    }

    return (
      <div id="app-root">
        <main className="container">
          { content }
        </main>
      </div>
    );
  }
}
