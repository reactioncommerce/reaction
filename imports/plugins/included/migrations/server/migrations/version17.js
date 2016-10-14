import { Migrations } from "meteor/percolate:migrations";
import { OrderSearch, AccountSearch } from "/lib/collections";
import { buildOrderSearch, buildAccountSearch } from "/imports/plugins/included/search-mongo/server/methods/searchcollections";

Migrations.add({
  version: 17,
  up: function() {
    OrderSearch.remove({});
    AccountSearch.remove();
    buildOrderSearch();
    buildAccountSearch();
  }
});
