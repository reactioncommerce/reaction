import _ from "lodash";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";
import { ReactiveDict } from "meteor/reactive-dict";
import { Shops } from "/lib/collections";

/* eslint-disable camelcase */
const templates = {
  iou_example: "exampleSettings",
  stripe_card: "stripeSettings"
};
/* eslint-enable camelcase */

function modifyPaymentMethods(paymentMethods) {
  const methods = [];
  for (const method of paymentMethods) {
    if (method.name !== "marketplace_stripe_card") {
      methods.push(method);
    }
  }
  return methods;
}

Template.paymentSettings.onCreated(async function () {
  this.state = new ReactiveDict();
  this.state.setDefault({ shopId: null, paymentMethods: [] });

  const [shopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);
  const { paymentMethods } = await simpleGraphQLClient.queries.paymentMethods({ shopId });
  this.state.set({
    shopId,
    paymentMethods: modifyPaymentMethods(paymentMethods)
  });
});

Template.paymentSettings.helpers({
  checked(enabled) {
    if (enabled === true) {
      return "checked";
    }
    return "";
  },
  shown(enabled) {
    if (enabled !== true) {
      return "hidden";
    }
    return "";
  },
  paymentMethodOptions() {
    const options = [{ label: "Auto", value: "none" }];

    const legacyMethods = Reaction.Apps({ packageName: "discount-codes", provides: "paymentMethod" });
    if (_.isArray(legacyMethods)) {
      for (const method of legacyMethods) {
        if (!method.enabled) continue;
        options.push({
          label: i18next.t(method.i18nKeyLabel),
          value: method.settingsKey
        });
      }
    }

    const paymentMethods = Template.instance().state.get("paymentMethods");
    if (_.isArray(paymentMethods)) {
      for (const method of paymentMethods) {
        if (!method.isEnabled) continue;
        options.push({
          label: method.displayName,
          value: method.name
        });
      }
    }

    return options;
  },
  paymentMethodList() {
    const paymentMethods = Template.instance().state.get("paymentMethods");
    for (const method of paymentMethods) {
      method.template = templates[method.name];
    }
    return paymentMethods;
  },
  shop() {
    return Shops.findOne(Reaction.getShopId());
  }
});

// toggle payment methods visibility
Template.paymentSettings.events({
  "change input[name=enabled]": async (event) => {
    event.preventDefault();

    const { state } = Template.instance();
    const isEnabled = event.target.checked;
    const paymentMethodName = event.target.getAttribute("data-name");
    const packageId = event.target.getAttribute("data-id");

    // Handle legacy discount codes payment method
    if (paymentMethodName === "discount-codes" && packageId) {
      const fields = [{
        property: "enabled",
        value: isEnabled
      }];
      Meteor.call("registry/update", packageId, paymentMethodName, fields);
      Meteor.call("shop/togglePackage", packageId, !isEnabled);
      return;
    }

    const response = await simpleGraphQLClient.mutations.enablePaymentMethodForShop({
      input: {
        shopId: state.get("shopId"),
        paymentMethodName,
        isEnabled
      }
    });
    const paymentMethods = _.get(response, "enablePaymentMethodForShop.paymentMethods");
    state.set("paymentMethods", modifyPaymentMethods(paymentMethods));
  }
});

AutoForm.hooks({
  shopEditPaymentMethodsForm: {
    onSuccess() {
      return Alerts.toast(i18next.t("shopSettings.shopPaymentMethodsSaved"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("shopSettings.shopPaymentMethodsFailed")} ${error}`, "error");
    }
  }
});
