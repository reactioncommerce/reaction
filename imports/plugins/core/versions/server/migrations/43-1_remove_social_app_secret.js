import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

/**
 * This is a point migration which unsets appSecret if it exists.
 * appSecret is unused and unnecessary for reaction-social.
 *
 * This migration has been backported to several legacy versions of Reaction Commerce.
 * Depending on what version you patched,
 * you may have different migration version numbers used for this particular migration.
 */

Migrations.add({
  version: 43.1,
  up() {
    Packages.update({
      name: "reaction-social"
    }, {
      $unset: {
        "settings.public.apps.facebook.appSecret": ""
      }
    }, { bypassCollection2: true, multi: true });
  }
});
