import { AutoForm } from "meteor/aldeed:autoform";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
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


Template.searchSettings.events({
  "click [data-event-action=showSearchSettings]"() {
    Reaction.showActionView();
  }
});

AutoForm.hooks({
  "search-update-form": {
    onSuccess() {
      Alerts.removeSeen();
      return Alerts.toast(i18next.t("searchSettings.settingsSaved"), "success");
    },
    onError(operation, error) {
      Alerts.removeSeen();
      return Alerts.toast(`${i18next.t("searchSettings.settingsFailed")} ${error}`, "error");
    }
  }
});
