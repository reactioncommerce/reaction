import { Migrations } from "meteor/percolate:migrations";
import Logger from "@reactioncommerce/logger";
import rawCollections from "/imports/collections/rawCollections";
import { setDefaultsForNavigationTreeItems } from "../util/convert65";

Migrations.add({
  version: 65,
  async up() {
    const { NavigationTrees } = rawCollections;

    // Find all navigation trees
    const navigationTrees = await NavigationTrees.find({}).toArray();

    try {
      // Update default values for each tree
      Promise.await(Promise.all(navigationTrees.map((tree) => {
        // Update any undefined values for items
        const items = setDefaultsForNavigationTreeItems(tree.items, {
          shouldNavigationTreeItemsBeAdminOnly: false,
          shouldNavigationTreeItemsBePubliclyVisible: true,
          shouldNavigationTreeItemsBeSecondaryNavOnly: false
        });

        // Update any undefined values for draft items
        const draftItems = setDefaultsForNavigationTreeItems(tree.draftItems, {
          shouldNavigationTreeItemsBeAdminOnly: false,
          shouldNavigationTreeItemsBePubliclyVisible: true,
          shouldNavigationTreeItemsBeSecondaryNavOnly: false
        });

        // Update items and draft items
        return NavigationTrees.updateOne({
          _id: tree._id
        }, {
          $set: {
            items,
            draftItems
          }
        });
      })));
    } catch (error) {
      Logger.error(error);
    }
  }
});
