const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
	mode: 'development',
  context: __dirname,
  devtool: 'inline-source-map',
  entry: ['./src/test.js'],
  output: {
    filename: './test.js',
    path: path.resolve(__dirname),
  },
  serve: {},
	resolve: {
		modules: [
			path.resolve('./src'),
			'node_modules',
		],
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader',
				]
			},
		]
	},
	plugins: [
		new webpack.NamedModulesPlugin(),
		new HtmlWebpackPlugin(),
	],
};

//const targetMain = {
//	entry: [ './src/main.js' ],
//	output: {
//		filename: 'main.js',
//		path: path.resolve(__dirname, 'dist'),
//		publicPath: '/',
//	},
//	module: {
//		noParse: /^viewer\.js|^test\.js|\.test\.js|^viewer$/,
//	},
//} 
//
//const targetTest = {
//	entry: [ './src/test.js' ],
//	output: {
//		filename: 'test.js',
//		path: path.resolve(__dirname, 'dist'),
//		publicPath: '/',
//	},
//	module: {
//		noParse: /^viewer\.js|^main\.js|^viewer$/,
//	},
//}
//
//const targetViewer = {
//	entry: [ './src/shipViewer.js' ],
//	output: {
//		filename: 'shipViewer.js',
//		path: path.resolve(__dirname, 'dist'),
//		publicPath: '/',
//	},
//	module: {
//		noParse: /^test\.js|^main\.js|\.test\.js/,
//	},
//}
//
//const SetupDev = function(target) {
//	target.mode = 'development';
//	target.devtool = 'cheap-eval-source-map';
//	let plugins = [
//		new webpack.HotModuleReplacementPlugin(),
//	];
//	target.plugins = target.plugins.concat(plugins);
//	target.serve = {
//		open: false,
//		hot: true,
//	}
//	return target;
//}
//
//const SetupProc = function(target) {
//	target.mode = 'production';
//	target.devtool = 'none';
//	target.plugins.push(new CleanWebpackPlugin(['dist']));
//	return target;
//}
//
//const SetupTarget = function(target, setupModeFunc) {
//	target.resolve = {
//		modules: [
//			path.resolve('./src'),
//			'node_modules',
//		],
//	}
//	target.module.rules = [
//		{
//			test: /\.css$/,
//			use: [
//				'style-loader',
//				'css-loader',
//			]
//		},
//	];
//	target.plugins = [
//		new HtmlWebpackPlugin(),
//	];
//	target = setupModeFunc(target);
//	return target;
//}
//
//module.exports = function(env, argv) {
//	if ( env.BUILDTARGET == 'mainDev' ) {
//		return SetupTarget(targetMain, SetupDev);
//	}
//	else if ( env.BUILDTARGET == 'mainProc' ) {
//		return SetupTarget(targetMain, SetupProc);
//	}
//	else if ( env.BUILDTARGET == 'testDev' ) {
//		return SetupTarget(targetTest, SetupDev);
//	}
//	else if ( env.BUILDTARGET == 'testProc' ) {
//		return SetupTarget(targetTest, SetupProc);
//	}
//	else if ( env.BUILDTARGET == 'viewerDev' ) {
//		return SetupTarget(targetViewer, SetupDev);
//	}
//	else if ( env.BUILDTARGET == 'viewerProc' ) {
//		return SetupTarget(targetViewer, SetupProc);
//	}
//}
