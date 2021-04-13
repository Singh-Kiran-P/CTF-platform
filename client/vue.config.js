module.exports = {
    runtimeCompiler: true, // for lazy loading route pages and loading uploaded html pages
    configureWebpack: { // for connecting to back-end node server without localhost prefix
        devServer: {
            proxy: {
                "^/api": {
                    target: `http://${process.env.API_HOST}:${process.env.API_SERVER}`,
                    changeOrigin: true,
                    logLevel: "debug",
                    pathRewrite: {
                        "^/api": "/"
                    }
                },
            },
            port: process.env.SERVER_PORT
        }
    }
};
