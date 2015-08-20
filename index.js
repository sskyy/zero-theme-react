var React = require('react')
var path = require('path')
var _ = require('lodash')
var webpack = require('webpack')
var webpackMiddleware = require('koa-webpack-dev-middleware')
var webpackCfg = require('./webpack.dev.config')
var fs = require('fs')
var serve = require('./static');


require('node-jsx').install({extension: '.jsx'})
require.extensions['.css'] = _.noop
require.extensions['.less'] = _.noop

function readEntries(entriesDef) {

  //read dir
  var entries = {}
  if( entriesDef.path ){
    fs.readdirSync(entriesDef.path).forEach(function (f) {
      if (!/^\./.test(f) && fs.statSync(path.join(entriesDef.path, f)).isDirectory()) {
        entries[f] = path.join(entriesDef.path, f, 'index.jsx')
      }
    });
  }


  //read spec
  if (entriesDef.spec) {
    _.forEach(entriesDef.spec, function (def, entryName) {
      if( def.path ) entries[entryName] = path.join(def.path, 'index.jsx')
    })
  }

  return entries
}


function generateCommonResourceHandler(entriesDef, moduleName) {
  //生成 koa-webpack-middleware
  var config = _.extend(webpackCfg, {
    entry: readEntries(entriesDef),
    resolve: {
      extensions: ['', '.js', '.jsx'],
      root : path.join(__dirname,'../', moduleName)
    },
  })

  var middleware = webpackMiddleware(webpack(config), {
    publicPath: `/${entriesDef.base}/`,
  })


  return function *resourceHandler(next) {
    return yield middleware.call(this, next)
  }
}


function *pageHandler(entriesDef, entryName) {
//TODO production 情况

  var entryDef = _.defaults(_.get(entriesDef, `spec.${entryName}`, {}), {
    base : entriesDef.base,
    name: entryName,
    container: entriesDef.container,
    entry: require(path.join(entriesDef.path, entryName)),
  })

  //context 执行一次
  entryDef.context = _.result(entryDef, 'context', {})
  this.body = React.renderToStaticMarkup(React.createElement(entryDef.container, entryDef))
}



/*
exports
 */

var themeModule = {
  init: function (app) {
    this.log = app.logger.mlog.bind(this.logger, "request")
  },
  assets : [],
  routes: {},
  reliers : {},
  extend : function( module ){
    this.reliers[module.name] = module
  },
  extend: function (module) {
    /*entries
     {
     base : 'user',
     path : '../user/entries',
     container : React Component,
     context : function(){}
     }
     或者
     {
     spec : {
     'home' : {
     entry : React Component,
     container : React Component,
     context : function(){}
     },
     'contact' : {
     ...
     }
     }
     }
     */

    var root = this

    //root.log('handler', `/${module.entries.base}/${entryName}.js`)


    if( module.entries ){
      module.entries.base = module.entries.base || module.name
      //TODO 检测冲突
      //generator bind 之后变成了普通的Function，所以这里只能这样

      var that = this
      var entries = readEntries( module.entries )

      var commonResourceHandler = generateCommonResourceHandler(module.entries, module.name)

      _.forEach(entries, function( entriesPath, entryName ){
        root.log(`/${module.entries.base}/${entryName}.html`)

        that.routes[`/${module.entries.base}/${entryName}.html`] = function *(next) {
          return yield pageHandler.call(this, module.entries,  entryName, next)
        }


        root.log('handler', `/${module.entries.base}/${entryName}.js`)
        that.routes[`/${module.entries.base}/${entryName}.js`] = commonResourceHandler
      })
    }


    if( module.assets ){
      if( !module.assets.map  ) console.log( module.assets)
      this.assets = this.assets.concat( module.assets.map(function( asset ){
        return _.defaults( asset, {
          base : module.name
        })
      }))
    }

  },
  bootstrap : {
    fn:function( app ){

    this.log('serving', this.assets)
    this.assets.forEach(function( asset ){
      app.use( serve(asset.path, {prefix:`/${asset.base}`}))
    })
    },
    before:['request']
  }
}

module.exports = themeModule
