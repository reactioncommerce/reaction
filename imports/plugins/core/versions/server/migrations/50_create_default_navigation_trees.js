import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";
import createDefaultNavigationTree from "/imports/plugins/core/versions/server/util/createDefaultNavigationTree";
import migrateTagNav from "/imports/plugins/core/versions/server/util/migrateTagNav";

const { NavigationTrees, Shops } = rawCollections;

Migrations.add({
  version: 50,
  up() {
    Shops.find({}).forEach(async (shop) => {
      const { _id: shopId } = shop;
      const treeId = await createDefaultNavigationTree(shop, "Main Navigation");
      migrateTagNav(shopId, treeId);
    });
  },
  down() {
    Shops.find({}).forEach(({ _id, defaultNavigationTreeId }) => {
      if (defaultNavigationTreeId) {
        NavigationTrees.deleteOne({ _id: defaultNavigationTreeId });
        Shops.updateOne({ _id }, { $unset: { defaultNavigationTreeId: "" } });
      }
    });
  }
});
