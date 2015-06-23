/**
 * @author "Evgeny Reznichenko" <kusakyky@gmail.com>
 */

var
    webpack = require('webpack'),
    p = require('path'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        index: './src/client/index.js'
    },

    output: {
        path: './static/assets/',
        filename: '[name].js',
        chunkFilename: '[chunkName].js',
        publicPath: '/assets/'
    },

    resolve: {
        root: [
            p.join(__dirname, 'node_modules')
        ]
    },

    module: {
        loaders: [
            {
                test: /\.js/,
                loader: 'babel',
                exclude: [/node_modules/]
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?module')
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin('style.css')
    ],

    devtool: 'sourcemap'
};
