import { h, Component } from 'preact';

export default class BrowserAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      pomodoroFinishTimestamp: Math.floor(Date.now() / 1000),
    };
  }

  async componentDidMount() {
    const result = await browser.storage.local.get('pomodoro');
    this.setState({
      initialized: true,
      pomodoroFinishTimestamp: result.pomodoro,
    });

    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.pomodoro) {
        this.setState({ pomodoroFinishTimestamp: changes.pomodoro.newValue });
      }
    });
  }

  blockWebsite = async () => {
    const tabs = await browser.tabs.query({ active: true });
    if (tabs.length === 0) {
      return;
    }
    // TODO: validate URL
    browser.runtime.sendMessage({
      type: 'blacklist.add',
      params: tabs[0].url,
    });
  };

  setPomodoro = async () => {
    browser.runtime.sendMessage({
      type: 'pomodoro.set',
      params: 10,
    });
  };

  render() {
    const { initialized, pomodoroFinishTimestamp } = this.state;
    let secondsLeft = pomodoroFinishTimestamp - Math.floor(Date.now() / 1000);
    if (initialized) {
      secondsLeft = secondsLeft > 0 ? secondsLeft : 0;
    }

    return (
      <div id="app-root w-40">
        <main className="container">
          <h1 className="text-2xl font-semibold text-center">Flow</h1>
          <div className="flex justify-center flex-col">
            <button type="button" onClick={this.blockWebsite} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4">
              Add to blacklist
            </button>
            <button type="button" onClick={this.setPomodoro} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4">
              Pomodoro 30 minutes
            </button>
          </div>
          <div className="text-center text-bold">
            {`Seconds left: ${secondsLeft}`}
          </div>
          <div className="text-center underline">
            <a
              href={browser.runtime.getURL('options.html')}
              target="_blank"
              rel="noopener noreferrer"
            >
              settings
            </a>
          </div>
        </main>
      </div>
    );
  }
}
