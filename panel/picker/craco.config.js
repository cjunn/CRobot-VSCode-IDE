module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            // 禁用 sourcemap
            if (env === 'production') {
                webpackConfig.devtool = false; // 在生产环境下禁用 sourcemap
            } else {
                webpackConfig.devtool = 'eval-source-map'; // 在开发环境下使用 eval-source-map，如果你不需要任何sourcemap，也可以设置为 false
            }
            return webpackConfig;
        }
    },
    devServer: {
        client: {
            overlay: false
        }
    }
}
