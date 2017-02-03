import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import "./methods.html";

Template.corePaymentMethods.helpers({
  enabledPayments() {
    const enabledPayments = [];
    const apps = Reaction.Apps({
      provides: "paymentMethod",
      enabled: true
    });
    for (app of apps) {
      if (app.enabled === true) enabledPayments.push(app);
    }
    return enabledPayments;
  }
});

Template.corePaymentMethods.events({
  "click [data-event-action=configure-payment-methods]"(event) {
    event.preventDefault();

    const dashboardRegistryEntry = Reaction.Apps({ name: "reaction-dashboard", provides: "shortcut" });
    const paymentRegistryEntry = Reaction.Apps({ name: "reaction-payments", provides: "settings" });

    Reaction.showActionView([
      dashboardRegistryEntry[0],
      paymentRegistryEntry[0]
    ]);
  }
});
