import { concat } from "lodash";
import { Meteor } from "meteor/meteor";
import { Migrations } from "meteor/percolate:migrations";
import { Logger } from "/server/api";
import { Groups, Shops } from "/lib/collections";

/**
 * Migration file created for removing the admin role from shop-manager group
 * On up, it creates the default groups for all shops in the app, then update accounts belonging to the
 * default groups. It also creates custom groups for every unique set of permission and assigns accounts
 * with such permissions to the custom group they belong.
 */

Migrations.add({
  version: 19,
  up() {
    const shops = Shops.find({}).fetch();
    if (shops && shops.length) {
      shops.forEach((shop) => {
        const shopManager = Groups.findOne({ name: "shop manager", shopId: shop._id });
        if (shopManager) {
          const shopManagerRoles = shopManager.permissions;
          const newShopManagerRoles = shopManagerRoles.filter((permission) => permission !== "admin");
          const groupId = Groups.update({
            name: "shop manager",
            shopId: shop._id
          }, { $set: { permissions: newShopManagerRoles }
          });
          Logger.debug(`group "shop manager" with id "${groupId}" updated(admin role removed)`);

          Meteor.users.update({
            [`roles.${shop._id}`]: { $size: shopManagerRoles.length, $all: shopManagerRoles }
          }, { $set: {
            [`roles.${shop._id}`]: newShopManagerRoles
          }
          });
          Logger.debug(`users with "shop manager" in shop "${shop._id}" updated(admin role removed)`);
        }
      });
    }
  },

  down() {
    const shops = Shops.find({}).fetch();

    if (shops && shops.length) {
      shops.forEach((shop) => {
        const shopManager = Groups.findOne({ name: "shop manager", shopId: shop._id });
        if (shopManager) {
          const shopManagerRoles = shopManager.permissions;
          // add admin role
          const newShopManagerRoles = concat(shopManagerRoles, "admin");
          const groupId = Groups.update({
            name: "shop manager",
            shopId: shop._id
          }, { $set: { permissions: newShopManagerRoles }
          });
          Logger.debug(`group "shop manager" with id "${groupId}" updated(admin role added)`);

          Meteor.users.update({
            [`roles.${shop._id}`]: { $size: shopManagerRoles.length, $all: shopManagerRoles }
          }, { $set: {
            [`roles.${shop._id}`]: newShopManagerRoles
          }
          });
          Logger.debug(`users with "shop manager" in shop "${shop._id}" updated(admin role added)`);
        }
      });
    }
  }
});
