const path = require('path');
module.exports = {
	"output": {
		"filename": "index.js",
		"path": path.resolve('./lib'),
		"libraryTarget": "commonjs"
	},
	"module": {
		"rules": [
			{
				"test": /\.(ts|js)$/i,
				"exclude": [/webpack/, /babel/, /core-js/],
				"use": [
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
	"plugins": [],
	"mode": "production",
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
	"entry": path.resolve('./src/index')
}