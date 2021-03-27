// for connecting to back-end node server without localhost prefix
module.exports = {
  configureWebpack: {
    devServer: {
      proxy: {
        "^/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          logLevel: "debug",
          pathRewrite: {
            "^/api": "/"
          }
        },
      },
    },
  },
};
