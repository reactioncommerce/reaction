import { Template } from "meteor/templating";
import { Packages } from "/lib/collections";


Template.launchdockSettings.onCreated(function () {
  this.subscribe("launchdock-auth");
});


Template.launchdockSettings.helpers({
  packageData() {
    return Packages.findOne({
      name: "reaction-connect"
    });
  }
});


Template.launchdockSettings.events({
  "submit #launchdock-ssl-update-form"(event, tmpl) {
    event.preventDefault();

    const opts = {
      domain: tmpl.find("input[name='ssl-domain']").value,
      privateKey: tmpl.find("textarea[name='ssl-private-key']").value,
      publicCert: tmpl.find("textarea[name='ssl-certificate']").value
    };

    Meteor.call("launchdock/setCustomSsl", opts, (err) => {
      if (err) {
        Alerts.removeSeen();
        Alerts.add("SSL settings update failed. " + err.reason, "danger");
        return;
      }
      Alerts.add("SSL settings saved. Connecting to Launckdock...", "success", {
        autoHide: true
      });
    });
  }
});
