import { Migrations } from "meteor/percolate:migrations";
import { MongoInternals } from "meteor/mongo";

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

Migrations.add({
  version: 20,
  up() {
    db.dropCollection("cfs._tempstore.chunks");
    db.dropCollection("cfs_gridfs._tempstore.chunks");
    db.dropCollection("cfs_gridfs._tempstore.files");
  }
});
