module.exports = {
  chainWebpack: config => {
    config
      .entry("app")
      .clear()
      .add("./src/client/main.js")
      .end();
  },
  devServer: {
    disableHostCheck: true,
  },
}
