import { Migrations } from "meteor/percolate:migrations";
import { OrderSearch, AccountSearch } from "/lib/collections";
import { buildOrderSearch,
  buildAccountSearch } from "/imports/plugins/included/search-mongo/server/methods/searchcollections";

Migrations.add({
  version: 1,
  up() {
    OrderSearch.remove({});
    AccountSearch.remove({});
    buildOrderSearch();
    buildAccountSearch();
  },
  down() {
    // whether we are going up or down we just want to update the search collections
    // to match whatever the current code in the build methods are.
    OrderSearch.remove({});
    AccountSearch.remove({});
    buildOrderSearch();
    buildAccountSearch();
  }
});
