import { Migrations } from "meteor/percolate:migrations";
import { OrderSearch, AccountSearch } from "/lib/collections";
import { Reaction, Logger } from "/server/api";

let buildOrderSearch;
let buildAccountSearch;

async function loadSearchRecordBuilderIfItExists() {
  const searchPackage = Reaction.getPackageSettings("reaction-search");

  if (typeof searchPackage === "object") {
    Logger.debug("Found stock search-mongo (reaction-search) plugin.");

    ({
      buildOrderSearch,
      buildAccountSearch
    } = await import("/imports/plugins/included/search-mongo/server/methods/searchcollections"));
  } else {
    Logger.warn("Failed to load reaction-search plugin. Skipping building order and account search records " +
                "on version migration step 1.");
  }
}

loadSearchRecordBuilderIfItExists().then(() => Migrations.add({
  version: 1,
  up() {
    OrderSearch.remove({});
    AccountSearch.remove({});

    if (buildOrderSearch) {
      buildOrderSearch();
    }

    if (buildAccountSearch) {
      buildAccountSearch();
    }
  },
  down() {
    // whether we are going up or down we just want to update the search collections
    // to match whatever the current code in the build methods are.
    OrderSearch.remove({});
    AccountSearch.remove({});

    if (buildOrderSearch) {
      buildOrderSearch();
    }

    if (buildAccountSearch) {
      buildAccountSearch();
    }
  }
}), (err) => Logger.warn(`Failed to run version migration step 1. Received error: ${err}.`));
