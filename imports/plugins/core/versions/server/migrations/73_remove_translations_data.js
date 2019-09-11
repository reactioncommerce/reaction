import { MongoInternals } from "meteor/mongo";
import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

Migrations.add({
  version: 73,
  async up() {
    const { Assets } = rawCollections;

    await Assets.deleteMany({ type: "i18n" });

    try {
      await db.dropCollection("Translations");
    } catch (error) {
      // This seems to throw an error from mongo NPM pkg, but only after
      // dropping the collections, so we'll just ignore
    }
  }
  // Down migration is not possible. Translations data will be re-imported on startup anyway
});
