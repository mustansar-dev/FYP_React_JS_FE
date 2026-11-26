const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/main.jsx',
  output: { path: path.resolve(__dirname, 'dist'), filename: 'assets/[name].[contenthash].js', clean: true, publicPath: '/' },
  resolve: { extensions: ['.js', '.jsx'] },
  module: { rules: [
    { test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
    { test: /\.css$/, use: ['style-loader', 'css-loader'] },
  ] },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
    new webpack.DefinePlugin({
      'process.env.PLAYSPOT_API_BASE_URL': JSON.stringify(process.env.PLAYSPOT_API_BASE_URL || ''),
    }),
  ],
  devServer: {
    historyApiFallback: true, hot: true, open: false, port: 5173,
    proxy: [{
      context: ['/api'], target: 'http://127.0.0.1:4000',
      on: { proxyReq: proxyRequest => proxyRequest.removeHeader('origin') },
    }],
  },
};
