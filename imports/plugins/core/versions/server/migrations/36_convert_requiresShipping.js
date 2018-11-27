import { Migrations } from "meteor/percolate:migrations";
import { Catalog, Products } from "/lib/collections";

Migrations.add({
  version: 36,
  up() {
    Catalog.update({}, {
      $set: {
        "product.supportedFulfillmentTypes": ["shipping"]
      },
      $unset: {
        "product.requiresShipping": ""
      }
    }, { bypassCollection2: true, multi: true });

    Products.update({}, {
      $set: {
        supportedFulfillmentTypes: ["shipping"]
      },
      $unset: {
        requiresShipping: ""
      }
    }, { bypassCollection2: true, multi: true });
  },
  down() {
    Catalog.update({}, {
      $unset: {
        "product.supportedFulfillmentTypes": ""
      }
    }, { bypassCollection2: true, multi: true });

    Products.update({}, {
      $unset: {
        supportedFulfillmentTypes: ""
      }
    }, { bypassCollection2: true, multi: true });
  }
});
