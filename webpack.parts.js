'use strict';
const config = require('./config');
const webpack = require('webpack');
const path = require('path');
const progressBarPlugin = require('progress-bar-webpack-plugin');
const chalk = require('chalk');
const cleanWebpackPlugin = require('clean-webpack-plugin');
const handlebarsPlugin = require('handlebars-webpack-plugin');
const styleLintPlugin = require('stylelint-webpack-plugin');
const purifyCSSPlugin = require('purifycss-webpack');
const extractTextPlugin = require('extract-text-webpack-plugin');
const glob = require('glob-all');
const optimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');
const babelWebpackPlugin = require('babel-minify-webpack-plugin');
const compressionPlugin = require('compression-webpack-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');
const imageminPlugin = require('imagemin-webpack-plugin').default;
const imageminMozjpeg = require('imagemin-mozjpeg');

const paths = {
	app: path.join(__dirname, 'app'),
	build: path.join(__dirname, 'dist')
};

const purifyCSS = new purifyCSSPlugin({
	paths: glob.sync([paths.app + '/assets/hbs/*.hbs', paths.app + '/assets/hbs/partials/*.hbs']),
	purifyOptions: {
		minimize: true
	}
});

exports.progress = () => ({
	plugins: [
		new progressBarPlugin({
			format: chalk.magenta.bold('build [:bar]') + chalk.magenta.bold(' :percent') + chalk.magenta.bold(' :elapsed seconds'),
			clear: false
		})
	]
});

exports.devServer = ({
	host,
	port,
	open
} = {}) => ({
	devServer: {
		historyApiFallback: true,
		stats: 'errors-only',
		host,
		port,
		https: config.https,
		publicPath: '/' + config.productionFolderName,
		contentBase: config.productionFolderName,
		hot: true,
		open,
		overlay: {
			errors: true,
			warnings: true,
		}
	}

});

exports.clean = (path) => ({
	plugins: [
		new cleanWebpackPlugin([path]),
	]
});

exports.handlebarsBuild = () => ({
	plugins: [
		new handlebarsPlugin({
			// path to hbs entry file(s)
			entry: paths.app + '/hbs/default.hbs',
			output: paths.build + '/index.html',

			data: paths.app + '/assets/data/pages.json',

			// globbed path to partials, where folder/filename is unique
			partials: [paths.app + '/hbs/partials/*.hbs'],

			// hooks
			onBeforeSetup: function(Handlebars) {},
			onBeforeAddPartials: function(Handlebars, partialsMap) {},
			onBeforeCompile: function(Handlebars, templateContent) {},
			onBeforeRender: function(Handlebars, data) {},
			onBeforeSave: function(Handlebars, resultHtml, filename) {},
			onDone: function(Handlebars, filename) {}
		})
	]
});

exports.lintSCSS = () => ({
	plugins: [
		new styleLintPlugin({
			failOnError: false,
			configFile: '.stylelintrc.json'
		})
	]
});

exports.eslint = () => ({
	module: {
		rules: [{
			test: /\.js$/,
			enforce: 'pre',
			exclude: /node_modules/,
			loader: 'eslint-loader',
			options: {
				fix: false,
				configFile: '.eslintrc.js',
				emitWarning: true
			}
		}]
	}
});

exports.loadCSS = () => ({
	module: {
		rules: [{
				test: /\.(scss)$/,
				use: [{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader',
						options: {
							autoprefixer: false,
							sourceMap: true
						}
					},
					{
						loader: 'postcss-loader',
						options: {
							plugins: () => {
								return [
									require('precss'),
									require('autoprefixer'),
								];
							},
							sourceMap: true
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true
						}
					},
					{
						loader: 'resolve-url-loader'
					}
				],
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader',
					'resolve-url-loader',
					{
						loader: 'postcss-loader',
						options: {
							plugins: () => ([
								require('precss'),
								require('postcss-cssnext')
							]),
							importLoaders: 1
						},
					},
					'sass-loader',
				],
			},
		],
	},
});

exports.extractCSS = () => {
	const extractText = new extractTextPlugin({
		filename: 'css/zanussi.css',
		allChunks: true
	});

	const tether = new webpack.ProvidePlugin({
		'window.Tether': 'tether'
	});

	return {
		module: {
			rules: [{
				test: /\.css$/,
				use: extractText.extract({
					use: ['css-loader', 'resolve-url-loader'],
					fallback: 'style-loader'
				}),
			}, {
				test: /\.scss$/,
				use: extractText.extract({
					use: ['css-loader', 'resolve-url-loader', 'sass-loader'],
					fallback: 'style-loader'
				}),
			}],
		},
		plugins: [extractText, tether]
		//plugins: [extractText, tether, purifyCSS]
	};
};

exports.minifyCSS = ({
	options
}) => ({
	plugins: [
		new optimizeCSSAssetsPlugin({
			cssProcessor: cssnano,
			cssProcessorOptions: options,
			canPrint: false,
		}),
	],
});

exports.loadImages = () => ({
	module: {
		rules: [{
			test: /\.(jpe?g|png|gif|svg|ico)$/i,
			use: {
				loader: 'url-loader',
				options: {
					name: 'images/[hash]-[name].[ext]'
				}
			}
		}]
	}
});

exports.loadJavaScript = () => ({
	module: {
		rules: [{
			test: /\.js$/,
			use: 'babel-loader',
		}, ],
	},
});

exports.minifyJavaScript = () => ({
	plugins: [
		new babelWebpackPlugin(),
	]
});

exports.compression = () => ({
	plugins: [
		new compressionPlugin({
			test: /\.(js|css)$/
		})
	]
});

exports.imageCompression = () => ({
	plugins: [
		new copyWebpackPlugin([{
			from: './app/assets/images/',
			to: 'images/'
		}]),
		new imageminPlugin({
			test: /\.(jpe?g|png|gif|svg|ico)$/i,
			plugins: [
				imageminMozjpeg({
					quality: 51,
					progressive: false
				})
			]
		})
	]
});