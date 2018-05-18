const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = function(env, argv) {
	if ( env.BUILDTARGET == 'main' ) {
		return {
			mode: 'development',
			entry: [ './src/main.js' ],
			output: {
				filename: 'main.js',
				path: path.resolve(__dirname, 'dist'),
				publicPath: '/',
			},
			resolve: {
				modules: [
					path.resolve('./src'),
					'node_modules',
				],
			},
			devtool: 'cheap-module-source-map',
			module: {
				rules: [
					{
						test: /\.css$/,
						use: [
							'style-loader',
							'css-loader',
						]
					},
					{
						test: /\.(html|svg)$/,
						use: {
							loader: 'html-loader',
							options: {
								attrs: [':data-src']
							}
						}
					},
				]
			},
			devServer: {
				open: false,
				hot: true,
				historyApiFallback: true,
			},
			plugins: [
				new HtmlWebpackPlugin(),
				new CleanWebpackPlugin(['dist']),
				new webpack.NamedModulesPlugin(),
				new webpack.HotModuleReplacementPlugin(),
			],
		}
	}
	else if ( env.BUILDTARGET == 'test' ) {
		return {
			mode: 'development',
			entry: [ './src/test.js' ],
			output: {
				filename: 'test.js',
				path: path.resolve(__dirname, 'dist'),
				publicPath: '/',
			},
			resolve: {
				modules: [
					path.resolve('./src'),
					'node_modules',
				],
			},
			devtool: 'cheap-module-source-map',
			module: {
				rules: [
					{
						test: /\.css$/,
						use: [
							'style-loader',
							'css-loader',
						]
					},
					{
						test: /\.(html|svg)$/,
						use: {
							loader: 'html-loader',
							options: {
								attrs: [':data-src']
							}
						}
					},
				]
			},
			devServer: {
				open: false,
				hot: true,
				historyApiFallback: true,
			},
			plugins: [
				new HtmlWebpackPlugin(),
				new CleanWebpackPlugin(['dist']),
				new webpack.NamedModulesPlugin(),
				new webpack.HotModuleReplacementPlugin(),
			],
		}
	}
}
