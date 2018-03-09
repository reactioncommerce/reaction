import { Migrations } from "meteor/percolate:migrations";
import { OrderSearch } from "/lib/collections";
import { Reaction, Logger } from "/server/api";

let buildOrderSearch;

async function loadSearchRecordBuilderIfItExists() {
  const searchPackage = Reaction.getPackageSettings("reaction-search");

  if (typeof searchPackage === "object") {
    Logger.debug("Found stock search-mongo (reaction-search) plugin.");

    ({ buildOrderSearch } = await import("/imports/plugins/included/search-mongo/server/methods/searchcollections"));
  } else {
    Logger.warn("Failed to load reaction-search plugin. Skipping building order search records on version migration " +
                "step 14.");
  }
}

loadSearchRecordBuilderIfItExists().then(() => Migrations.add({
  // Migrations 12 and 13 introduced changes on Orders, so we need to rebuild the search collection
  version: 14,
  up() {
    OrderSearch.remove({});

    if (buildOrderSearch) {
      buildOrderSearch();
    }
  },
  down() {
    // whether we are going up or down we just want to update the search collections
    // to match whatever the current code in the build methods are.
    OrderSearch.remove({});

    if (buildOrderSearch) {
      buildOrderSearch();
    }
  }
}), (err) => Logger.warn(`Failed to run version migration step 14. Received error: ${err}.`));
