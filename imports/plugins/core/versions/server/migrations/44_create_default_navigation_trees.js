import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";
import createDefaultNavigationTree from "/imports/plugins/core/navigation/server/no-meteor/util/createDefaultNavigationTree";

const { NavigationItems, Shops } = rawCollections;

Migrations.add({
  version: 44,
  up() {
    Shops.find({}).forEach((shop) => {
      createDefaultNavigationTree(shop, "Main Navigation");
    });
  },
  down() {
    Shops.find({}).forEach(({ _id, defaultNavigationTreeId }) => {
      if (defaultNavigationTreeId) {
        NavigationTrees.deleteOne({ _id: defaultNavigationTreeId });
        Shops.updateOne({ _id }, { $unset: { defaultNavigationTreeId: "" }});
      }
    });
  }
});
