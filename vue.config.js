const {resolve} = require('path')
module.exports = {
  devServer:{
    proxy:{
      '/api':{
        target:'http://localhost:8888',
        changeOrigin: true
      }
    }
  },
  configureWebpack:config=>{
    config.resolve.alias.pages = resolve(__dirname,'src/pages')
    config.resolve.alias.lib = resolve(__dirname,'src/lib')
    config.resolve.alias.tpl = resolve(__dirname,'src/components')
  },
  chainWebpack: config => {
    if(process.env.NODE_ENV === 'development'){
      config.module.rule('eslint').use('eslint-loader').tap(options=>{
        options.fix = true
        return options
      })
    }

  }
}
