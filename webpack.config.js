const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
        sidepanel: path.resolve('./src/sidepanel/index.tsx'),
        options: path.resolve('./src/options/index.tsx'),
        background: path.resolve('./src/background/background.ts'),
    },
    plugins: [
        new CopyPlugin({
          patterns: [
            { from: path.resolve('src/static'), to: path.resolve('dist') },
          ],
        }),
        ...getHtmlPlugins(['sidepanel', 'options']),
    ],
    module: {
        rules: [
            {
                use: 'ts-loader',
                test: /\.tsx$/,
                exclude: /node_modules/
            },
            {
                use: ['style-loader', 'css-loader', {
                    loader: 'postcss-loader',
                    options: {
                        postcssOptions: {
                            ident: 'postcss',
                            plugins: [tailwindcss, autoprefixer],
                        },
                    }
                }],
                test: /\.css$/i,
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    output: {
        filename: '[name].js',
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    }
}

function getHtmlPlugins(chunks) {
    return chunks.map(chunk => new HtmlPlugin({
        title: 'Chrome CoPilot',
        filename: `${chunk}.html`,
        chunks: [chunk],
    }));
}