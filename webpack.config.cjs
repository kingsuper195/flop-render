const path = require('path');
// )
// import * as path from 'node:path';
// import { fileURLToPath } from 'node:url';
// import * as webpack from 'webpack';
const webpack = require('webpack');

// webpack.ProvidePlugin
module.exports = {
    entry: './index.js',
    mode: "production",
    experiments: {
        outputModule: true,
    },
    plugins: [
        new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'flop-render.js',
        library: {
            // name: 'flopRender',
            type: 'module',
        },
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            // "stream": require.resolve('stream-browserify'),
            "buffer": require.resolve('buffer/'),
        },
    },
};
