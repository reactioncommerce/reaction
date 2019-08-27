module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: "jest"
    },
    binary: {
      version: "3.6.14",
      skipMD5: true
    },
    autoStart: false
  }
};
