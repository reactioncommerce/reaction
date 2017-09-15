import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Mongo, MongoInternals } from "meteor/mongo";


// Add the aggregate function available in tbe raw collection to normal collections
Mongo.Collection.prototype.aggregate = function (pipelines, options) {
  const coll = this._getCollection();
  return Meteor.wrapAsync(coll.aggregate.bind(coll))(pipelines, options);
};

Mongo.Collection.prototype._getDb = function () {
  if (typeof this._collection._getDb === "function") {
    return this._collection._getDb();
  }
  const  mongoConn = MongoInternals.defaultRemoteCollectionDriver().mongo;
  return wrapWithDb(mongoConn);
};

Mongo.Collection.prototype._getCollection = function () {
  const db = this._getDb();
  return db.collection(this._name);
};

function wrapWithDb(mongoConn) {
  if (mongoConn.db) {
    return mongoConn.db;
  }
}

/**
 * Create a Reactive collection from a Mongo aggregate pipeline
 * @param {Object} sub - The publication we are creating
 * @param {Collection} collection - the collection we are operating on
 * @param {Array} pipeline - The mongo aggregation pipeline to run
 * @param {Object} options - an object of options
 * @returns {Cursor} A mongo cursor for subscription
 * @constructor
 */
export function ReactiveAggregate(sub, collection, pipeline, options) {
  check(pipeline, Array);
  check(options, Match.Optional(Object));

  const defaultOptions = {
    observeSelector: {},
    observeOptions: {},
    clientCollection: collection._name
  };
  const subOptions = Object.assign({}, defaultOptions, options);

  let initializing = true;
  sub._ids = {};
  sub._iteration = 1;

  function update() {
    if (initializing) {
      return;
    }

    // add and update documents on the client
    collection.aggregate(pipeline).forEach(function (doc) {
      if (!sub._ids[doc._id]) {
        sub.added(subOptions.clientCollection, doc._id, doc);
      } else {
        sub.changed(subOptions.clientCollection, doc._id, doc);
      }
      sub._ids[doc._id] = sub._iteration;
    });
    // remove documents not in the result anymore
    _.forEach(sub._ids, function (value, key) {
      if (value !== sub._iteration) {
        delete sub._ids[key];
        sub.removed(subOptions.clientCollection, key);
      }
    });
    sub._iteration++;
  }

  // track any changes on the collection used for the aggregation
  const query = collection.find(subOptions.observeSelector, subOptions.observeOptions);
  const handle = query.observeChanges({
    added: update,
    changed: update,
    removed: update,
    error: function (error) {
      throw new Meteor.Error(`Encountered an error while observing ${collection._name}`, error);
    }
  });
  // observeChanges() will immediately fire an "added" event for each document in the query
  // these are skipped using the initializing flag
  initializing = false;
  // send an initial result set to the client
  update();
  // mark the subscription as ready
  sub.ready();

  // stop observing the cursor when the client unsubscribes
  sub.onStop(function () {
    handle.stop();
  });
}
