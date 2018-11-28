import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Reaction } from "/client/api";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import "./methods.html";

/* eslint-disable camelcase */
const templates = {
  iou_example: "ExampleIOUPaymentForm",
  marketplace_stripe_card: "stripeMarketplacePaymentForm",
  stripe_card: "stripePaymentForm"
};
/* eslint-enable camelcase */

Template.corePaymentMethods.onCreated(async function () {
  this.state = new ReactiveDict();
  this.state.setDefault({ availablePaymentMethods: [], isLoading: true });

  const payments = enabledPayments();
  const paymentsEnabled = payments.length;
  // If no payments enabled, show payments settings dashboard
  if (!paymentsEnabled) {
    openActionView();
  }

  const [shopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);
  const { availablePaymentMethods } = await simpleGraphQLClient.queries.availablePaymentMethods({ shopId });
  availablePaymentMethods.sort((a, b) => ((a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1));
  this.state.set({ availablePaymentMethods, isLoading: false });
});

Template.corePaymentMethods.helpers({
  enabledDiscountCodes() {
    return Reaction.Apps({
      enabled: true,
      packageName: "discount-codes",
      provides: "paymentMethod"
    });
  },
  enabledPayments,
  isAdmin() {
    return Reaction.hasAdminAccess();
  },
  isLoading() {
    return Template.instance().state.get("isLoading");
  },
  LoadingComponent() {
    return Components.Loading;
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
