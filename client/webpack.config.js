const NODE_ENV = process.env.NODE_ENV || 'development'

const DEV = NODE_ENV === 'development'

module.exports = {
  mode: NODE_ENV,
  devtool: DEV ? 'inline-source-map' : 'none',
  optimization: {
    minimize: !DEV
  },
  entry: './src/index.ts',
  output: {
    filename: 'content.bundle.js'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js', '.scss']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.js?$/, loader: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  }
}
