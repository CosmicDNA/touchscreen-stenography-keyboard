module.exports = {
  webpack: {
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
