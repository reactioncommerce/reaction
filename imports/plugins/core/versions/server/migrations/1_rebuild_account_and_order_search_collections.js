import Logger from "@reactioncommerce/logger";
import { Migrations } from "meteor/percolate:migrations";
import { OrderSearch, AccountSearch } from "/lib/collections";
import { buildAccountSearch, buildOrderSearch } from "../util/searchcollections";

Migrations.add({
  version: 1,
  up() {
    OrderSearch.remove({});
    AccountSearch.remove({});

    try {
      buildOrderSearch();
      buildAccountSearch();
    } catch (error) {
      Logger.error("Error running up() on version 1", error);
    }
  },
  down() {
    // whether we are going up or down we just want to update the search collections
    // to match whatever the current code in the build methods are.
    OrderSearch.remove({});
    AccountSearch.remove({});

    try {
      buildOrderSearch();
      buildAccountSearch();
    } catch (error) {
      Logger.error("Error running down() on version 1", error);
    }
  }
});
