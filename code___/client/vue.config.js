const path = require('path');
var hostURL
if (process.env.HOSTING == "DOCKER")
    hostURL = `http://${process.env.VUE_APP_API_HOST_DOCKER}:${process.env.VUE_APP_API_PORT}`;
if (process.env.HOSTING == "LOCALHOST")
    hostURL = `http://${process.env.VUE_APP_API_HOST}:${process.env.VUE_APP_API_PORT}`;

module.exports = {
    runtimeCompiler: true, // for lazy loading route pages and loading uploaded html pages
    configureWebpack: { // for connecting to back-end node server without localhost prefix
        devServer: {
            port: process.env.VUE_APP_PORT,
            proxy: {
                "^/api": {
                    target: hostURL,
                    changeOrigin: true,
                    logLevel: "debug",
                    pathRewrite: {
                        "^/api": ""
                    }
                },

            },
            disableHostCheck: true,   // That solved it
            watchOptions: {
                ignored: [
                    /node_modules/,
                    /public/
                ],
                poll: true,
            }
        }
    },
    chainWebpack: config => {
        config.resolve.alias.set('@/shared/src', path.resolve('../shared/src'))
    }
};
