module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: "jest",
      storageEngine: "wiredTiger",
      oplogSize: 8,
      replSet: "rs0"
    },
    binary: {
      version: "3.6.14",
      skipMD5: true
    },
    autoStart: false,
    debug: true
  }
};
