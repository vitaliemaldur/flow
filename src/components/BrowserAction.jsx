import { h, Component } from 'preact';

class BrowserAction extends Component {
  render() {
    return (
      <div id="app-root">
        <h1>Flow</h1>
        <button>Activate deep work</button>
        <a onClick={() => browser.runtime.openOptionsPage() } >Settings</a>
      </div>
    );
  }
}

export default BrowserAction;