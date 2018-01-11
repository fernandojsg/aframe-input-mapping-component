const path = require('path');

// dist/
var filename = 'aframe-input-mapping-component.js';
var outPath = 'dist';
if (process.env.AFRAME_DIST) {
  outPath = 'dist';
  if (process.env.NODE_ENV === 'production') {
    filename = 'aframe-input-mapping-component.min.js';
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