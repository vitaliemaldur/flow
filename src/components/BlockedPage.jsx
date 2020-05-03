import { h, Component } from 'preact';

export default class BrowserAction extends Component {
  whitelistAdd = async (minutes) => {
    const tabs = await browser.tabs.query({ active: true });
    if (tabs.length === 0) {
      return;
    }

    browser.runtime.sendMessage({
      type: 'whitelist.add',
      params: [tabs[0].id, minutes],
    });
  };

  render() {
    return (
      <div>
        <main className="container mr-auto">
          <div className="jumbotron mt-5">
            <div className="row">
              <div className="col-sm-8">
                <h1>This website is blocked</h1>
                <p className="lead">
                  Keep your flow state. This website will distract you from the work that you have
                  to do! Stay strong and be productive!
                </p>
                <hr />
                <div className="row">
                  <div className="col-sm-12 m-1">
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={() => (window.close())}
                    >
                      Keep working
                    </button>
                  </div>
                  <div className="col-sm-12 m-1">
                    <button
                      type="button"
                      className="btn btn-danger btn-block"
                      onClick={() => (this.whitelistAdd(5))}
                    >
                      Pause for 5 minutes
                    </button>
                  </div>
                  <div className="col-sm-12 m-1">
                    <button
                      type="button"
                      className="btn btn-danger btn-block"
                      onClick={() => (this.whitelistAdd(10))}
                    >
                      Pause for 10 minutes
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-sm-4">
                <img
                  className="img-fluid"
                  src="https://media.giphy.com/media/P8WZZ0NYdbXAA/giphy.gif"
                  alt="blocked website"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
