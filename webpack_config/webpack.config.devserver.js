/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const path = require("path");
const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin")
const common = require("./webpack.config.common.js");

module.exports = merge(common, {
  output: {
    path: path.resolve(__dirname, "../dev"),
    filename: '[name].js',
    libraryTarget: 'umd',
    globalObject: 'this',
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [{from:'./public/assets', to:'../dev/assets'}]
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      scriptLoading: "blocking"
    })
  ],

});