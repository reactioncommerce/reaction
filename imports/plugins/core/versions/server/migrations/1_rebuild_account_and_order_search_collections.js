import Logger from "@reactioncommerce/logger";
import rawCollections from "/imports/collections/rawCollections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

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
    Logger.err("Failed to load reaction-search plugin. Skipping building order and account search records " +
                "on version migration step 1.");
  }
}

loadSearchRecordBuilderIfItExists()
  .then(() => {
    export async function up(next) {
      await rawCollections.OrderSearch.remove({});
      await rawCollections.AccountSearch.remove({});

      if (buildOrderSearch) {
        await buildOrderSearch();
      }

      if (buildAccountSearch) {
        await buildAccountSearch();
      }
      next();
    }

    export async function down(next) {
      // whether we are going up or down we just want to update the search collections
      // to match whatever the current code in the build methods are.
      await rawCollections.OrderSearch.remove({});
      await rawCollections.AccountSearch.remove({});

      if (buildOrderSearch) {
        await buildOrderSearch();
      }

      if (buildAccountSearch) {
        await buildAccountSearch();
      }
      next();
    }
  })
  .catch((err) => Logger.warn(`Failed to run version migration step 1. Received error: ${err}.`));
