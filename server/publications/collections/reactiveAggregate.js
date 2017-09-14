import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Mongo, MongoInternals } from "meteor/mongo";

// This code taken from https://github.com/meteorhacks/meteor-aggregate
// Add the aggregate function available in tbe raw collection to normal collections
Mongo.Collection.prototype.aggregate = function (pipelines, options) {
  const coll = this._getCollection();
  return Meteor.wrapAsync(coll.aggregate.bind(coll))(pipelines, options);
};

// this group of methods were taken from https://github.com/meteorhacks/meteor-collection-utils
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

// this code taken from https://github.com/JcBernack/meteor-reactive-aggregate
// ## Usage
// ReactiveAggregate(sub, collection, pipeline, options)
//
// - `sub` should always be `this` in a publication.
// - `collection` is the Mongo.Collection instance to query.
// - `pipeline` is the aggregation pipeline to execute.
// - `options` provides further options:
//   - `observeSelector` can be given to improve efficiency. This selector is used for observing the collection.
// (e.g. `{ authorId: { $exists: 1 } }`)
// - `observeOptions` can be given to limit fields, further improving efficiency. Ideally used to limit fields on your query.
//   If none is given any change to the collection will cause the aggregation to be reevaluated.
// (e.g. `{ limit: 10, sort: { createdAt: -1 } }`)
// - `clientCollection` defaults to `collection._name` but can be overriden to sent the results
// to a different client-side collection.
//
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
export function ReactiveAggregate(sub, collection, pipeline, options) {
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
