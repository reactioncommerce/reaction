import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

Migrations.add({
  version: 27,
  up() {
    Packages.update({
      "registry.template": "smsSettings"
    }, {
      $set: {
        "registry.$.template": "SmsSettings"
      }
    }, { bypassCollection2: true });
  },
  down() {
    Packages.update({
      "registry.template": "SmsSettings"
    }, {
      $set: {
        "registry.$.template": "smsSettings"
      }
    }, { bypassCollection2: true });
  }
});
