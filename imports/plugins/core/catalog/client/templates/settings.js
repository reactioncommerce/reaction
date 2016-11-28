import { Packages } from "/lib/collections";

Template.catalogSettings.helpers({
  //
  // check if this package setting is enabled
  //
  checked(pkg) {
    let enabled;
    const pkgData = Packages.findOne(pkg.packageId);
    const setting = pkg.name.split("/").splice(-1);

    if (pkgData && pkgData.settings) {
      if (pkgData.settings[setting]) {
        enabled = pkgData.settings[setting].enabled;
      }
    }
    return enabled === true ? "checked" : "";
  },
  //
  // Template helper to add a hidden class if the condition is false
  //
  shown(pkg) {
    let enabled;
    const pkgData = Packages.findOne(pkg.packageId);
    const setting = pkg.name.split("/").splice(-1);

    if (pkgData && pkgData.settings) {
      if (pkgData.settings[setting]) {
        enabled = pkgData.settings[setting].enabled;
      }
    }

    return enabled !== true ? "hidden" : "";
  }
});

Template.catalogSettings.events({
  /**
   * taxSettings settings update enabled status for tax service on change
   * @param  {event} event    jQuery Event
   * @return {void}
   */
  "change input[name=enabled]": (event) => {
    const name = event.target.value;
    const packageId = event.target.getAttribute("data-id");
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];

    Meteor.call("registry/update", packageId, name, fields);
  }
});
