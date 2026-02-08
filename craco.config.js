module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable source map loader for all node_modules
      webpackConfig.module.rules.push({
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: /node_modules/,
      });
      
      // Ignore source map warnings for chart.js
      webpackConfig.ignoreWarnings = [
        {
          module: /node_modules\/chart\.js/,
        },
      ];
      
      return webpackConfig;
    },
  },
};
