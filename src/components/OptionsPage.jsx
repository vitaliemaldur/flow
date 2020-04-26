import { h, Component, Fragment } from 'preact';

export default class BrowserAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      blacklist: [],
    };
  }

  async componentDidMount() {
    const result = await browser.storage.local.get('blacklist');
    this.setState({
      initialized: true,
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
    const { initialized, blacklist } = this.state;
    let content = (
      <Fragment>
        <div>Loading</div>
      </Fragment>
    );

    if (initialized) {
      content = (
        <Fragment>
          <ul>
            { blacklist.map((hostname) => (<li>{hostname}</li>)) }
          </ul>
        </Fragment>
      );
    }

    return (
      <div id="app-root" style={{ width: 250, height: 400 }}>
        <h1>Flow options</h1>
        { content }
      </div>
    );
  }
}
