import { Meteor } from "meteor/meteor";
import { Mongo, MongoInternals } from "meteor/mongo";

// This code taken from https://github.com/meteorhacks/meteor-aggregate
// Add the aggregate function available in tbe raw collection to normal collections
Mongo.Collection.prototype.aggregate = function (pipelines, options) {
  const coll = this._getCollection();
  return Meteor.wrapAsync(coll.aggregate.bind(coll))(pipelines, options);
};

// this group of methods were taken from https://github.com/meteorhacks/meteor-collection-utils
/**
 * Provides a way to get at the underlying instance of the DB connection
 * @private
 * @returns {Object} The underlying Mongo connection
 */
Mongo.Collection.prototype._getDb = function () {
  if (typeof this._collection._getDb === "function") {
    return this._collection._getDb();
  }
  const mongoConn = MongoInternals.defaultRemoteCollectionDriver().mongo;
  return wrapWithDb(mongoConn);
};

/**
 * Provides a way to get at the underlying instance of the Collection
 * @private
 * @returns {Object} The underlying Mongo collection
 */
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
 * @summary Provides a wrapper around the results of a Mongo aggregate query to make it Reactive
 * @param {Object} pub - The instance of the publication we are creating
 * @param {Object} collection - The Mongo.Collection instance to query
 * @param {Array} pipeline - The aggregation pipeline to use
 * @param {Object} options - Optional options
 *  - `observeSelector` can be given to improve efficiency. This selector is used for observing the collection.
 // (e.g. `{ authorId: { $exists: 1 } }`)
 // - `observeOptions` can be given to limit fields, further improving efficiency. Ideally used to limit fields on your query.
 //   If none is given any change to the collection will cause the aggregation to be reevaluated.
 // (e.g. `{ limit: 10, sort: { createdAt: -1 } }`)
 // - `clientCollection` defaults to `collection._name` but can be overriden to sent the results
 // to a different client-side collection.
 @example
 // ## Quick Example
 //
 // A publication for one of the
 //   [examples](https://docs.mongodb.org/v3.0/reference/operator/aggregation/group/#group-documents-by-author)
 // in the MongoDB docs would look like this:
 //
 // Meteor.publish("booksByAuthor", function () {
//   ReactiveAggregate(this, Books, [{
//     $group: {
//       _id: "$author",
//       books: { $push: "$$ROOT" }
//     }
//   }]);
// });
 * @constructor
 */
export function ReactiveAggregate(pub, collection, pipeline, options) {
  const defaultOptions = {
    observeSelector: {},
    observeOptions: {},
    clientCollection: collection._name
  };
  const pubOptions = Object.assign({}, defaultOptions, options);

  let initializing = true;
  pub._ids = {};
  pub._iteration = 1;

  // run this function every time a record changes
  function update() {
    if (initializing) {
      return;
    }

    // add and update documents on the client
    collection.aggregate(pipeline).forEach((doc) => {
      if (!pub._ids[doc._id]) {
        pub.added(pubOptions.clientCollection, doc._id, doc);
      } else {
        pub.changed(pubOptions.clientCollection, doc._id, doc);
      }
      pub._ids[doc._id] = pub._iteration;
    });
    // remove documents not in the result anymore
    for (const [key, value] of Object.entries(pub._ids)) {
      if (value !== pub._iteration) {
        delete pub._ids[key];
        pub.removed(pubOptions.clientCollection, key);
      }
    }
    pub._iteration += 1;
  }

  // track any changes on the collection used for the aggregation
  const query = collection.find(pubOptions.observeSelector, pubOptions.observeOptions);
  const handle = query.observeChanges({
    added: update,
    changed: update,
    removed: update,
    error(error) {
      throw new Meteor.Error("server-error", `Encountered an error while observing ${collection._name}`, error);
    }
  });
  // observeChanges() will immediately fire an "added" event for each document in the query
  // these are skipped using the initializing flag
  initializing = false;
  // send an initial result set to the client
  update();
  // mark the subscription as ready
  pub.ready();

  // stop observing the cursor when the client unsubscribes
  pub.onStop(() => {
    handle.stop();
  });
}
