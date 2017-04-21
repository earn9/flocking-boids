const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'var',
        filename: 'bundle.js'
    },
    devtool: "source-map"
};