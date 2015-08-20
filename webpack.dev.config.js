'use strict';
let path = require('path');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let assign = require('object-assign');
let webpack = require('webpack');


module.exports =  {
  output: {
    path : '/',
    filename: '[name].js',
    chunkFilename: '[name].js'
  },

  plugins: [
    //new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
    //new ExtractTextPlugin('[name].css', {
    //  allChunks: true
    //})
  ],
  //每个entry不一样，需要动态生成
  resolve: {
  },
  resolveLoader : {
    root : path.join(__dirname, "node_modules")
  },
  module: {
    loaders: [
      {test: /(\.jsx|\.js)/,loader:  'babel-loader' ,query: {compact: false},exclude: /node_modules/},
      {test: /\.css$/,loaders: ['style-loader' ,'css-loader']},
      //{ test: /\.less$/, loader: ExtractTextPlugin.extract(['css-loader'),absoluteLoader('less-loader')] },
      //{ test: /\.less$/, loader: ExtractTextPlugin.extract( 'css!less' )},
      { test: /\.less$/, loaders: ['style-loader' ,'css-loader','less-loader']},
      {test: /\.json$/, loader: 'json-loader'},
      {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/font-woff'},
      {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/font-woff'},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/octet-stream'},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=image/svg+xml'}
    ]
  },
  externals: {
    react: 'React'
  }
}


