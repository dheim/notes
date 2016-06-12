const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const path  = require('path');
const join  = path.join;

module.exports = {
  entry: {
    list: './src/js/list.js',
    form: './src/js/form.js',
    notes: './src/js/notes.js'
  },
  output: {
    path: path.join(__dirname, 'public/js/'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.handlebars$/,
        loader: "handlebars-loader"
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('css?sourceMap!less?sourceMap')
      },
      {
       test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
       loader: "url-loader?limit=10000&name=/[name].[ext]&mimetype=application/font-woff"
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader?name=/[name].[ext]"
      }
    ]
  },
  resolve: {
    extensions: ['', '.js']
  },
  plugins: [
    new ExtractTextPlugin('list.css'),
    new ExtractTextPlugin('form.css')
  ]
};