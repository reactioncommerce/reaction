import { MongoInternals } from "meteor/mongo";
import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const Translations = db.collection("Translations");

Migrations.add({
  version: 73,
  async up() {
    const { Assets } = rawCollections;

    await Assets.deleteMany({ type: "i18n" });
    await Translations.deleteMany({});
  }
  // Down migration is not possible. Translations data will be re-imported on startup anyway
});
