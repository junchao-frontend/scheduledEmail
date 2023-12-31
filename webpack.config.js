const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
module.exports = {
    entry: './index.js',
    output: {
        filename: 'bundle.js', // 打包的文件名 
        clean: true,
        path: path.resolve(__dirname, './dist') // __dirname表示当前路径
    },
    // devtool: 'inline-source-map', // 工具
    mode: 'development', // 模式
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html', // html模板
            filename: 'app.html',
            inject: 'body' // 生成的html js插入到body里面
        })
    ],
    devServer: {
      static: path.join(__dirname, 'dist'), // 静态文件目录
      port: 3000, // 服务器端口
      hot: true, // 启用热模块替换
      open: true, // 自动打开浏览器
      proxy: {
        '/api': {
          target: 'http://wufazhuce.com', // 目标域名
          changeOrigin: true,
          pathRewrite: {
            '^/api': '', // 移除路径中的/api前缀
          },
        },
      },
    },
}