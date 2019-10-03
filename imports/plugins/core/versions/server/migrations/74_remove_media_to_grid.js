import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";

Migrations.add({
  version: 74,
  async up() {
    const { MediaRecords } = rawCollections;

    await MediaRecords.updateMany({
      "metadata.toGrid": {
        $exists: true
      }
    }, {
      $unset: {
        "metadata.toGrid": ""
      }
    });
  },
  async down() {
    const { MediaRecords } = rawCollections;

    await MediaRecords.updateMany({
      "metadata.productId": {
        $exists: true
      }
    }, {
      $set: {
        "metadata.toGrid": 1
      }
    });
  }
});
