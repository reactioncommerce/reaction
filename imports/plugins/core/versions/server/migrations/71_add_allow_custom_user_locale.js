import { Migrations } from "meteor/percolate:migrations";
import { Shops } from "/lib/collections";

Migrations.add({
  version: 71,
  up() {
    Shops.update({}, { $set: { allowCustomUserLocale: true } }, { multi: true });
  }
});
