import { Migrations } from "meteor/percolate:migrations";
import { OrderSearch } from "/lib/collections";
import { buildOrderSearch } from "/imports/plugins/included/search-mongo/server/methods/searchcollections";

Migrations.add({
  // Migrations 12 and 13 introduced changes on Orders, so we need to rebuild the search collection
  version: 14,
  up: function () {
    OrderSearch.remove({});
    buildOrderSearch();
  },
  down: function () {
    // whether we are going up or down we just want to update the search collections
    // to match whatever the current code in the build methods are.
    OrderSearch.remove({});
    buildOrderSearch();
  }
});
