const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'background':  './src/background-scripts/background.js',
    'browser-action': './src/browser-action/index.jsx'
  },
  watch: true,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            ['@babel/plugin-transform-react-jsx', { pragma: 'h' }]
          ],
        }
      }
    ]
  },
  plugins: [
    new CopyPlugin([
      { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js' },
      { from: 'src/manifest.json', to: 'manifest.json' },
      { from: 'src/assets/icons', to: 'icons' },
      { from: 'src/browser-action/index.html', to: 'browser-action.html'  }
    ]),
  ],
  resolve: {
    alias: {
      "react": "preact-compat",
      "react-dom": "preact-compat"
    },
    extensions: ['.js', '.jsx']
  },
};