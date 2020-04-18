import { h } from 'preact';

export default function BrowserAction() {
  return (
    <div id="app-root">
      <h1>Flow</h1>
      <button type="button">Activate deep work</button>
      <button type="button" onClick={() => browser.runtime.openOptionsPage()}>Settings</button>
    </div>
  );
}
