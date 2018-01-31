import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import "./methods.html";

Template.corePaymentMethods.helpers({
  enabledPayments,
  isAdmin() {
    return Reaction.hasAdminAccess();
  }
});

Template.corePaymentMethods.onCreated(() => {
  const payments = enabledPayments();
  const paymentsEnabled = payments.length;
  // If no payments enabled, show payments settings dashboard
  if (!paymentsEnabled) {
    openActionView();
  }
});

Template.corePaymentMethods.events({
  "click [data-event-action=configure-payment-methods]"(event) {
    event.preventDefault();
    openActionView();
  }
});

function enabledPayments() {
  const enabledPaymentsArr = [];
  const apps = Reaction.Apps({
    provides: "paymentMethod",
    enabled: true
  });
  for (const app of apps) {
    if (app.enabled === true) enabledPaymentsArr.push(app);
  }
  return enabledPaymentsArr;
}

function openActionView() {
  const dashboardRegistryEntry = Reaction.Apps({ name: "reaction-dashboard", provides: "shortcut" });
  const paymentRegistryEntry = Reaction.Apps({ name: "reaction-payments", provides: "settings" });

  Reaction.showActionView([
    dashboardRegistryEntry[0],
    paymentRegistryEntry[0]
  ]);
}
