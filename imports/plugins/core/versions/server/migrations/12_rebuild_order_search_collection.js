import { Migrations } from "/imports/plugins/core/versions";
import { OrderSearch } from "/lib/collections";
import { buildOrderSearch } from "/imports/plugins/included/search-mongo/server/methods/searchcollections";

Migrations.add({
  // Migrations 10 and 11 introduced changes on Orders, so we need to rebuild the search collections.
  // Building OrderSearch here then covers the rebuild in migration 1 (so it was moved from migration 1 to here)
  version: 12,
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
