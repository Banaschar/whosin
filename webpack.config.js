const path = require('path');
const ThreeWebpackPlugin = require('@wildpeaks/three-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const webpack = require('webpack');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'main.bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    //devtool: 'inline-source-map',
    devtool: 'source-map',
    devServer: {
        contentBase: './dist'
    },
    plugins: [
            new CleanWebpackPlugin(['dist']),
            new ThreeWebpackPlugin(),
            new HtmlWebpackPlugin({
                title: 'Whos in'
            }),
    ],
    module: {
        rules: [
                {
                    test: /\.(dae|zip|png|jpg)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {}
                        }
                    ]
                }, {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader'
                    ]
                }
        ]
    }
};