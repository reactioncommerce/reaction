import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { ReactiveDict } from "meteor/reactive-dict";
import ReactComponentOrBlazeTemplate from "/imports/plugins/core/components/lib/ReactComponentOrBlazeTemplate";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import "./methods.html";

const templates = {
  iou_example: "ExampleIOUPaymentForm",
  stripe_card: "stripePaymentForm"
};

Template.corePaymentMethods.onCreated(async function () {
  this.state = new ReactiveDict();
  this.state.setDefault({ availablePaymentMethods: [] });

  const payments = enabledPayments();
  const paymentsEnabled = payments.length;
  // If no payments enabled, show payments settings dashboard
  if (!paymentsEnabled) {
    openActionView();
  }

  const [shopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);
  const { availablePaymentMethods } = await simpleGraphQLClient.queries.availablePaymentMethods({ shopId });
  availablePaymentMethods.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1);
  this.state.set({ availablePaymentMethods });
});

Template.corePaymentMethods.helpers({
  enabledPayments,
  isAdmin() {
    return Reaction.hasAdminAccess();
  },
  ReactComponentOrBlazeTemplate() {
    return ReactComponentOrBlazeTemplate;
  }
});

Template.corePaymentMethods.events({
  "click [data-event-action=configure-payment-methods]"(event) {
    event.preventDefault();
    openActionView();
  }
});

function enabledPayments() {
  const availablePaymentMethods = Template.instance().state.get("availablePaymentMethods");
  for (const method of availablePaymentMethods) {
    method.template = templates[method.name];
  }
  return availablePaymentMethods;
}

function openActionView() {
  const dashboardRegistryEntry = Reaction.Apps({ name: "reaction-dashboard", provides: "shortcut" });
  const paymentRegistryEntry = Reaction.Apps({ name: "reaction-payments", provides: "settings" });

  Reaction.showActionView([
    dashboardRegistryEntry[0],
    paymentRegistryEntry[0]
  ]);
}
