import { Migrations } from "/imports/plugins/core/versions";
import { AccountSearch } from "/lib/collections";
import { buildAccountSearch } from "/imports/plugins/included/search-mongo/server/methods/searchcollections";

Migrations.add({
  version: 1,
  up: function () {
    AccountSearch.remove();
    buildAccountSearch();
  },
  down: function () {
    // whether we are going up or down we just want to update the search collections
    // to match whatever the current code in the build methods are.
    AccountSearch.remove();
    buildAccountSearch();
  }
});
