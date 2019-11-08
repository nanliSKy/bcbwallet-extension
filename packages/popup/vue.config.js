module.exports = {
	lintOnSave: false,
	baseUrl: './',
	devServer: {// 开发环境使用
		port: 6688,
		host: 'localhost',
		open: false,
		proxy: {
			'/api': {
				target: 'https://testwallet.bcbchain.io',
				ws: true,
				changeOrigin: true,
				pathRewrite: {
	                '^/api': ''
	            }
			}
		}
	}
}