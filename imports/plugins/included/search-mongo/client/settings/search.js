import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";
import { SearchPackageConfig } from "../../lib/collections/schemas";


Template.searchSettings.helpers({
  SearchPackageConfig() {
    return SearchPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "reaction-search",
      shopId: Reaction.getShopId()
    });
  }
});

Template.searchSettings.helpers({
  packageData() {
    return Packages.findOne({
      name: "reaction-search",
      shopId: Reaction.getShopId()
    });
  }
});

Template.searchSettings.events({
  "click [data-event-action=showSearchSettings]"() {
    Reaction.showActionView();
  }
});

AutoForm.hooks({
  "search-update-form": {
    /* eslint-disable no-unused-vars*/
    onSuccess(operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add("Search settings saved.", "success");
    },
    onError(operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add("Search settings update failed. " + error, "danger");
    }
    /* eslint-enable no-unused-vars*/
  }
});
