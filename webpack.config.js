const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        library: 'Boids',
        path: path.resolve(__dirname, 'docs/assets/javascript'),
        libraryTarget: 'var',
        filename: 'bundle04.js'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: ['transform-runtime'],
                        presets: ['env']
                    }
                }
            }
        ]
    }
};