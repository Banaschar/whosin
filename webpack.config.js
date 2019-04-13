const path = require('path');
const ThreeWebpackPlugin = require('@wildpeaks/three-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'main.bundle.js',
        path: path.resolve(__dirname, 'appserver/static/scripts')
    },
    //devtool: 'inline-source-map',
    devtool: 'source-map',
    devServer: {
        contentBase: './appserver/static/scripts' // was ./dist
    },
    plugins: [
            new CleanWebpackPlugin(),
            new ThreeWebpackPlugin(),
            new HtmlWebpackPlugin({ title: 'Whos in' }),
            //new webpack.IgnorePlugin({ resourceRegExp: /\.json$/ }),
            new CopyWebpackPlugin([
                //{from: './src/config.json'},
                //{from: './src/assets/assets.zip', to: 'assets'}
                ])
    ],
    module: {
        rules: [
                {
                    test: /\.(dae|zip|png|jpg)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {name: '[name].[ext]'}
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