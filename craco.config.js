module.exports = {
  webpack: {
    module: {
      loaders: [
        {
          test: /[\\/]tweetnacl[\\/]/,
          loader: 'exports-loader?window.nacl!imports-loader?this=>window,module=>{},require=>false'
        }
      ],
      noParse: [
        /[\\/]tweetnacl[\\/]/
      ]
    },
    configure: {
      entry: './src/index.js',
      ignoreWarnings: [
        {
        // Change this to fit your needs
          module: /node_modules\/@mediapipe\/tasks-vision/
        }
      ]
    }
  }
}
