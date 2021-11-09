const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const entries = {
    demo1: './src/demo1/index.ts',
    demo2: './src/demo2/index.ts',
    demo3: './src/demo3/index.ts',
};

const htmlPlugins = Object.keys(entries).map(
    (key) =>
        new HtmlWebpackPlugin({
            template: `./src/${key}/index.html`,
            filename: `${key}.html`,
            chunks: [key],
        }),
);

module.exports = {
    entry: entries,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[chunkhash].js',
    },
    resolve: {
        extensions: ['.ts', '...'],
    },
    module: {
        rules: [
            // 加载着色器等文本文件，须在global.d.ts内声明模块类型
            {
                test: /\.(vs|fs)$/i,
                use: 'raw-loader',
            },
            {
                test: /\.(js|ts)?$/,
                include: [path.resolve(__dirname, 'src')],
                exclude: /node_modules/,
                use: ['babel-loader', 'ts-loader'],
            },
        ],
    },
    plugins: [new CleanWebpackPlugin(), ...htmlPlugins],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
            watch: true,
        },
        watchFiles: ['src/**/*'],
        port: 3003,
    },
};
