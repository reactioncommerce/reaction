import { Meteor } from "meteor/meteor";
import { Migrations } from "meteor/percolate:migrations";
import { Logger } from "/server/api";
import { Accounts, Groups, Shops } from "/lib/collections";

// Migration file created for removing the admin role from shop manager group, and users in the group
Migrations.add({
  version: 19,
  up() {
    const shops = Shops.find({}).fetch();
    if (shops && shops.length) {
      shops.forEach((shop) => {
        const shopManager = Groups.findOne({ slug: "shop manager", shopId: shop._id });
        if (shopManager) {
          const shopManagerRoles = shopManager.permissions;
          const newShopManagerRoles = shopManagerRoles.filter((permission) => permission !== "admin");
          Groups.update({
            slug: "shop manager",
            shopId: shop._id
          }, {
            $set: { permissions: newShopManagerRoles }
          });
          Logger.debug(`group "shop manager" with id "${shopManager._id}" updated(admin role removed)`);

          // update users in group to new roles
          const userIds = Accounts.find({ groups: shopManager._id }).fetch().map((acc) => acc._id);
          Meteor.users.update({
            _id: { $in: userIds }
          }, {
            $set: { [`roles.${shop._id}`]: newShopManagerRoles }
          }, {
            multi: true
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
        const shopManager = Groups.findOne({ slug: "shop manager", shopId: shop._id });
        if (shopManager) {
          const shopManagerRoles = shopManager.permissions;
          // add back admin role
          const newShopManagerRoles = shopManagerRoles.concat(["admin"]);
          Groups.update({
            slug: "shop manager",
            shopId: shop._id
          }, {
            $set: { permissions: newShopManagerRoles }
          });
          Logger.debug(`group "shop manager" with id "${shopManager._id}" updated(admin role added)`);

          // update users in group to new roles
          const userIds = Accounts.find({ groups: shopManager._id }).fetch().map((acc) => acc._id);
          Meteor.users.update({
            _id: { $in: userIds }
          }, {
            $set: { [`roles.${shop._id}`]: newShopManagerRoles }
          }, {
            multi: true
          });
          Logger.debug(`users with "shop manager" in shop "${shop._id}" updated(admin role added)`);
        }
      });
    }
  }
});
