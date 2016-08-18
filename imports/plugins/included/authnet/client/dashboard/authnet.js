import { Template } from "meteor/templating";
import { Packages } from "/lib/collections";
import { Reaction } from "/client/api";

import "./authnet.html";

function packageDataFunc() {
  return Packages.findOne({
    name: "reaction-auth-net",
    shopId: Reaction.getShopId()
  });
}

Template.authnetDashboard.helpers({
  packageData() {
    return packageDataFunc();
  },

  settingsExist() {
    let flag = false;
    const data = packageDataFunc();

    if (data && data.settings) {
      flag = data.settings.api_id && data.settings.transaction_key;
    }
    return flag;
  }
});

Template.authnetDashboard.events({
  "click [data-event-action=showAuthnetSettings]": function () {
    const isOpen = Reaction.isActionViewOpen();

    if (isOpen) {
      Reaction.hideActionView();
    } else {
      Reaction.showActionView();
    }
  }
});
