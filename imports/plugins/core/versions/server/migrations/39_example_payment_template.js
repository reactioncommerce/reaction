import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

Migrations.add({
  version: 39,
  up() {
    Packages.rawCollection().update({
      "registry.template": "examplePaymentForm"
    }, {
      $set: {
        "registry.$[elem].template": "ExampleIOUPaymentForm"
      }
    }, {
      arrayFilters: [{ "elem.template": "examplePaymentForm" }],
      multi: true
    });
  },
  down() {
    Packages.rawCollection().update({
      "registry.template": "ExampleIOUPaymentForm"
    }, {
      $set: {
        "registry.$[elem].template": "examplePaymentForm"
      }
    }, {
      arrayFilters: [{ "elem.template": "ExampleIOUPaymentForm" }],
      multi: true
    });
  }
});
