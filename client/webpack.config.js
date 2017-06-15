const webpack = require('webpack')
const path = require('path')
const debug = true

let plugins = [new webpack.ProvidePlugin({
  $: 'jquery',
  jQuery: 'jquery'
})]

var prodPlugins = [
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
      drop_console: true
    },
    output: {
      comments: false
    }
  })
]

if (!debug)
  plugins = plugins.concat(prodPlugins)

module.exports = {
  entry: {
    content: './src/app-content.js',
    background: './src/app-background.js',
    suggest: './src/app-suggest.js'
  },
  output: {
    path: './bin',
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.scss', '.css'],
    modulesDirectories: [
      path.resolve('./src/background_components'),
      path.resolve('./src/content_components'),
      path.resolve('./src/lib'),
      // path.resolve("./website/src/css"),
      path.resolve('./node_modules')
    ]
  },
  watch: debug,
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.s?css$/,
        loaders: ['style', 'css', 'sass']
      },
      {
        test: /\.svg$/,
      loader: 'svg-loader?pngScale=2'},
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader?limit=8192'
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file-loader?name=./../files/[hash].[ext]'
      }]
}, plugins}
