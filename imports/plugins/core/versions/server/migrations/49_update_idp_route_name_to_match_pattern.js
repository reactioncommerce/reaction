import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

/**
 * Previously, Hydra plugin's first route defined the name field as "OAuth Login", this changed in rc.8
 * to "account/login to match defined plugin conventions across the app". This migration updates existing document(s) for the route to match the update.
 */
Migrations.add({
  version: 49,

  up() {
    Packages.update(
      {
        name: "reaction-hydra-oauth"
      },
      {
        $set: {
          "registry.0.name": "account/login"
        }
      },
      { bypassCollection2: true, multi: true }
    );
  },

  down() {
    Packages.update(
      {
        name: "reaction-hydra-oauth"
      },
      {
        $set: {
          "registry.0.name": "OAuth Login"
        }
      },
      { bypassCollection2: true, multi: true }
    );
  }
});
