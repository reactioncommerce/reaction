module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: "jest",
      storageEngine: "wiredTiger",
      oplogSize: 8,
      replSet: "rs0"
    },
    binary: {
      version: "4.2.0",
      skipMD5: true
    },
    autoStart: false
  }
};
