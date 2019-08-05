import { Migrations } from "meteor/percolate:migrations";
// import { Packages } from "/lib/collections";

Migrations.add({
  version: 3,
  up() {
    // ED 5-13-2019 This migration is now running after packages load and
    // wiping out registry on a fresh installation. This may have been
    // correct at one point but I don't think it is anymore. Commenting out.

    // Packages.update(
    //   {}, {
    //     $set: {
    //       registry: []
    //     }
    //   },
    //   { bypassCollection2: true, multi: true }
    // );
  }
});
