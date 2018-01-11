const path = require('path');

// dist/
var filename = 'aframe-inspector.js';
var outPath = 'dist';
if (process.env.AFRAME_DIST) {
  outPath = 'dist';
  if (process.env.NODE_ENV === 'production') {
    filename = 'aframe-inspector.min.js';
  }
}

module.exports = {
  entry: './src/index.js',

  output: {
    path: path.resolve('dist'),
    filename: filename
  },

  module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader'
    }]
  }
};