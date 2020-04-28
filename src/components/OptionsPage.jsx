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

  render() {
    const { initialized, blacklist } = this.state;
    let content = (
      <Fragment>
        <div>Loading</div>
      </Fragment>
    );

    if (initialized) {
      content = (
        <div className="flex items-center flex-col">
          <h3>Blacklist</h3>
          <ul>
            { blacklist.map((hostname) => (
              <li className="space-x-2">
                <span>{hostname}</span>
                <button type="button" className="bg-red-500 px-1 text-white">delete</button>
              </li>
            )) }
          </ul>
        </div>
      );
    }

    return (
      <div id="app-root">
        <main className="container">
          <h1 className="text-2xl font-semibold text-center">Flow</h1>
          { content }
        </main>
      </div>
    );
  }
}
