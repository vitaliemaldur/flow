const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, 'src');

module.exports = {
  entry: {
    background: `${SRC_DIR}/background-scripts/background.js`,
    'browser-action': `${SRC_DIR}/browser-action/index.jsx`,
    options: `${SRC_DIR}/options/index.jsx`,
  },
  output: {
    filename: '[name].js',
    path: BUILD_DIR,
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                ['@babel/plugin-transform-runtime'],
                ['@babel/plugin-proposal-class-properties'],
                ['@babel/plugin-transform-react-jsx', { pragma: 'h' }],
              ],
            },
          },
          {
            loader: 'eslint-loader',
          }
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      // Running on watch mode will cause all the other files barring the changed one to be deleted,
      // if this is set to true
      cleanStaleWebpackAssets: false,
      verbose: true,
    }),
    new CopyPlugin([
      { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js' },
      { from: 'src/manifest.json', to: 'manifest.json' },
      { from: 'src/assets/icons', to: 'icons' },
      { from: 'src/browser-action/index.html', to: 'browser-action.html' },
      { from: 'src/options/index.html', to: 'options.html' },
    ]),
  ],
  resolve: {
    alias: {
      react: 'preact-compat',
      'react-dom': 'preact-compat',
    },
    extensions: ['.js', '.jsx'],
  },
};
