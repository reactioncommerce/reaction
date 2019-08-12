import { Migrations } from "meteor/percolate:migrations";
import { Shops } from "/lib/collections";

Migrations.add({
  version: 70,
  up() {
    Shops.update({}, { $unset: { appVersion: "" } }, { multi: true });
  }
});
