import { Migrations } from "meteor/percolate:migrations";
import { MongoInternals } from "meteor/mongo";

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

Migrations.add({
  version: 23,
  up() {
    try {
      Promise.await(db.dropCollection("cfs._tempstore.chunks"));
      Promise.await(db.dropCollection("cfs_gridfs._tempstore.chunks"));
      Promise.await(db.dropCollection("cfs_gridfs._tempstore.files"));
    } catch (error) {
      // These seem to throw an error from mongo NPM pkg, but only after
      // they succeed in dropping the collections, so we'll just ignore
    }
  }
});
