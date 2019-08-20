import { DDP } from "meteor/ddp-client";

const inMemoryCache = {};
const connectionKey = "connection-data";

/**
 * @returns {Object} connection data store or in memory cache
 */
function connectionData() {
  const invocation =
    DDP._CurrentMethodInvocation.get() ||
    DDP._CurrentPublicationInvocation.get();

  if (!invocation) {
    // operating outside of a connection
    return inMemoryCache;
  }

  const { connection } = invocation;

  if (!connection) {
    return inMemoryCache;
  }

  const hasDataKey = connectionKey in connection;

  if (!hasDataKey) {
    connection[connectionKey] = {};
  }

  return connection[connectionKey];
}

export default {
  get(key) {
    return connectionData()[key];
  },

  set(key, val) {
    connectionData()[key] = val;
  },

  clear(key) {
    delete connectionData()[key];
  }
};
