import { Migrations } from "meteor/percolate:migrations";
import { Reaction } from "/server/api";
import { Packages } from "/lib/collections";

// Migration file created for removing the admin role from shop manager group, and users in the group
Migrations.add({
  version: 20,
  up() {
    Packages.update({
      name: "reaction-marketplace",
      shopId: Reaction.getPrimaryShopId()
    }, {
      $set: {
        "settings.public.shopPrefix": "/shop"
      }
    });
  },

  down() {
    Packages.update({
      name: "reaction-marketplace",
      shopId: Reaction.getPrimaryShopId()
    }, {
      $unset: {
        "settings.public.shopPrefix": 1
      }
    });
  }
});
