const path = require("path");

module.exports = {
  resolve: {
    fallback: {
      "zlib": require.resolve("browserify-zlib"),
      "querystring": require.resolve("querystring-es3"),
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "url": require.resolve("url/"),
      "buffer": require.resolve("buffer/"),
      "os": require.resolve("os-browserify/browser"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "fs": false, // Filesystem module is not available in the browser
      "net": false, // Network module is not available in the browser
      "tls": false, // TLS module is not available in the browser
      "dns": false  // DNS module is not available in the browser
    },
  },
};