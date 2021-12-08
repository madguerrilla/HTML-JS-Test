//webpack.config.js
'use strict';
const webpack = require('webpack');
const merge = require('webpack-merge');
const config = require('./config');
const parts = require('./webpack.parts');
const path = require('path');
const log = console.log;

const paths = {
	dir: __dirname,
	app: path.join(__dirname, 'app'),
	build: path.join(__dirname, 'dist')
};

const commonConfig = merge([
	parts.progress(),
	{
		entry: ['bootstrap-loader', 'tether', './app/assets/js/app.js'],
		output: {
			path: path.resolve(__dirname, config.productionFolderName),
			filename: 'zanussi.js'
		},
		plugins: [
			new webpack.ProvidePlugin({
				$: 'jquery',
				jQuery: 'jquery',
				'window.jQuery': 'jquery',
				'window.$': 'jquery',
				Popper: ['popper.js', 'default'],
				Util: 'exports-loader?Util!bootstrap/js/dist/util'
			})
		]
	}
]);

const productionConfig = merge([
	parts.clean(paths.build),
	parts.handlebarsBuild(),
	parts.loadImages(),
	parts.eslint(),
	parts.extractCSS(),
	parts.loadJavaScript(),
	parts.minifyJavaScript(),
	parts.minifyCSS({
		options: {
			discardComments: {
				removeAll: true,
			},
			safe: true,
		},
	}),
	parts.compression(),
	parts.imageCompression()
]);

const developmentConfig = merge([
	parts.handlebarsBuild(),
	parts.loadCSS(),
	parts.loadImages(),
	parts.lintSCSS(),
	parts.devServer({
		host: config.webpackDevServer.host,
		port: config.webpackDevServer.port,
		open: config.webpackDevServer.open
	}),
	{
		plugins: [
			new webpack.HotModuleReplacementPlugin()
		]
	},
]);

module.exports = (env) => {
	process.env.NODE_ENV = env;
	log('Enviroment...', process.env.NODE_ENV);
	switch (env) {
		case 'production':
			return merge(commonConfig, productionConfig);
			break;
		case 'development':
			return merge(commonConfig, developmentConfig);
			break;
	}
};