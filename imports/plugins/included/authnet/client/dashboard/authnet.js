function packageDataFunc() {
  return Reaction.Collections.Packages.findOne({
    name: "reaction-auth-net"
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
    const isOpen = ReactionCore.isActionViewOpen();

    if (isOpen) {
      ReactionCore.hideActionView();
    } else {
      ReactionCore.showActionView();
    }
  }
});
