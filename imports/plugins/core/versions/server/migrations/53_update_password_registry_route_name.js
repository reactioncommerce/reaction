import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

Migrations.add({
  version: 53,
  up() {
    Packages.update({
      "name": "reaction-accounts",
      "registry.name": "Reset Password"
    }, {
      $set: {
        "registry.$.name": "reset-password"
      }
    }, { multi: true });
  },
  down() {
    Packages.update({
      "name": "reaction-accounts",
      "registry.name": "reset-password"
    }, {
      $set: {
        "registry.$.name": "Reset Password"
      }
    }, { multi: true });
  }
});
