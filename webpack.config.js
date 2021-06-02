const path = require('path');

module.exports = {
    mode: "development",
    entry: "./src/index.tsx",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.s[ac]ss$/i,
                use: ["style-loader", "css-loader", "sass-loader",],
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: '/'
    },
    resolve: {
        extensions: [
            '.ts',
            '.tsx',
            '.js'
        ]
    },
    devServer: {
        contentBase: 'dist/',
        historyApiFallback: true
    }
}