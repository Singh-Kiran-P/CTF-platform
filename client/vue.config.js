// for connecting to back-end node server without localhost prefix
module.exports = {
  configureWebpack: {
    devServer: {
      proxy: {
        "^/api": {
          target: `http://localhost:${process.env.API_SERVER}`,
          changeOrigin: true,
          logLevel: "debug",
          pathRewrite: {
            "^/api": "/"
          }
        },
      },
      port: process.env.SERVER_PORT
    },
  },
};
