import Logger from "@reactioncommerce/logger";
import { Migrations } from "meteor/percolate:migrations";
import { OrderSearch } from "/lib/collections";
import { buildOrderSearch } from "../util/searchcollections";

Migrations.add({
  version: 14,
  up() {
    OrderSearch.remove({});

    try {
      buildOrderSearch();
    } catch (error) {
      Logger.error("Error running up() on version 14", error);
    }
  },
  down() {
    // whether we are going up or down we just want to update the search collections
    // to match whatever the current code in the build methods are.
    OrderSearch.remove({});

    try {
      buildOrderSearch();
    } catch (error) {
      Logger.error("Error running down() on version 14", error);
    }
  }
});
