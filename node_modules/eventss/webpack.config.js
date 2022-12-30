const path = require('path');
module.exports = {
	"output": {
		"filename": "index.js",
		"path": path.resolve('./test')
	},
	"module": {
		"rules": [
			{
				"test": /\.(ts|js)$/i,
				"exclude": [/webpack/, /babel/, /core-js/],
				"use": [
					{
						"loader": "babel-loader",
						"options": {
							"babelrc": false,
							"presets": [
								[
									"@babel/preset-env",
									{
										"useBuiltIns": "usage",
										"modules": "umd"
									}
								]
							]
						}
					},
					{
						"loader": "ts-loader",
						"options": {
							"compilerOptions": {
								"module": "esnext",
								"target": "es5",
								"lib": [
									"es5",
									"es2015",
									"es2016",
									"es2017",
									"es2018",
									"dom"
								],
								"downlevelIteration": true,
								"allowJs": true,
								"declaration": false
							}
						}
					}
				]
			}
		]
	},
	"resolve": {
		"extensions": [
			".js",
			".ts"
		]
	},
	"plugins": [
		new (require('html-webpack-plugin'))({
            inject: false,
            template: require('html-webpack-template'),
            appMountId: 'app',
            meta: [{
                name: 'viewport',
                content: 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no'
            }]
        })
	],
	"mode": "development",
	"stats": {
		"colors": true,
		"hash": false,
		"version": false,
		"timings": false,
		"assets": false,
		"chunks": false,
		"modules": false,
		"reasons": false,
		"children": false,
		"source": false,
		"errors": true,
		"errorDetails": true,
		"warnings": false,
		"publicPath": false
	},
	"entry": path.resolve('./src/test'),
	"devServer": {
		"compress": true,
		"open": true,
		"host": "0.0.0.0",
		"disableHostCheck": true,
		"port": 3000,
		"useLocalIp": true,
		"contentBase": path.resolve('./test'),
		"https": false
	}
}