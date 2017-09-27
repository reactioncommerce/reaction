import { Migrations } from "meteor/percolate:migrations";
import { Reaction } from "/server/api/";
import { Shops } from "/lib/collections";

Migrations.add({
  // moving to multi-shop setup requries a primary shop to be set.
  // Updates the shop marked active with associated email for a domain as the primary shop
  version: 10,
  up() {
    Shops.update({
      "status": "active",
      "domains": Reaction.getDomain(),
      "emails.0.address": { $exists: true }
    }, {
      $set: { shopType: "primary" }
    });
  },
  down() {
    Shops.update({ shopType: "primary" }, {
      $unset: { shopType: "" }
    });
  }
});
