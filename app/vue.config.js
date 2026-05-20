const webpack = require('webpack')
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
            allowedHosts: 'all',
           client: {
                webSocketURL: 'auto://0.0.0.0:0/ws'
         }
        },
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                process: 'process/browser'
            })
        ], 
        resolve: {
            fallback: {
                crypto: require.resolve("crypto-browserify"),
                fs: false,
                assert: false,
                process: require.resolve("process/browser"),
                util: false,
                path: false,
                vm: false,
                stream: require.resolve("stream-browserify"),
            }
        }
    }
})
