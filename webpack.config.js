const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const BUILD_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, 'src');

module.exports = {
  entry: {
    background: `${SRC_DIR}/background-scripts/background.js`,
    options: `${SRC_DIR}/options/index.jsx`,
    'browser-action': `${SRC_DIR}/browser-action/index.jsx`,
    'blocked-page': `${SRC_DIR}/blocked-page/index.jsx`,
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
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                // eslint-disable-next-line global-require
                require('tailwindcss')('./tailwind.config.js'),
                // eslint-disable-next-line global-require
                require('autoprefixer'),
              ],
            }
          },
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
    new MiniCssExtractPlugin({
      filename: 'main.css',
      chunkFilename: 'main.css',
    }),
    new CopyPlugin([
      { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js' },
      { from: 'src/manifest.json', to: 'manifest.json' },
      { from: 'src/assets/icons', to: 'icons' },
      { from: 'src/browser-action/index.html', to: 'browser-action.html' },
      { from: 'src/options/index.html', to: 'options.html' },
      { from: 'src/blocked-page/index.html', to: 'blocked-page.html' },
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
