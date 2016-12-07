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
