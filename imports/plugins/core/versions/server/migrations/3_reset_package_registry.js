import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

Migrations.add({
  version: 3,
  up() {
    Packages.update(
      {}, {
        $set: {
          registry: []
        }
      },
      { bypassCollection2: true, multi: true }
    );
  }
});
