const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './background-scripts/background.js',
  watch: true,
  output: {
    filename: 'background.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  plugins: [
    new CopyPlugin([
      { from: 'manifest.json', to: 'manifest.json' },
      { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js' },
      { from: 'icons', to: 'icons' }
    ]),
  ],
};