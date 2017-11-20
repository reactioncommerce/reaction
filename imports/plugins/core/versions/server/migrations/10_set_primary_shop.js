import { Migrations } from "meteor/percolate:migrations";
import { Reaction } from "/server/api/";
import { Shops } from "/lib/collections";

Migrations.add({
  // moving to multi-shop setup requries a primary shop to be set.
  // Updates a shop marked active, that has associated email for domain as the primary shop
  version: 10,
  up() {
    Shops.update({
      "status": "active",
      "domains": Reaction.getDomain(),
      "emails.0.address": { $exists: true }
    }, {
      $set: { shopType: "primary" }
    }, { bypassCollection2: true });
  },
  down() {
    Shops.update({ shopType: "primary" }, {
      $unset: { shopType: "" }
    }, { bypassCollection2: true });
  }
});
