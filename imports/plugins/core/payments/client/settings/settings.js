import _ from "lodash";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { ReactiveDict } from "meteor/reactive-dict";
import { Shops } from "/lib/collections";

/* eslint-disable camelcase */
const templates = {
  iou_example: "exampleSettings",
  stripe_card: "stripeSettings"
};
/* eslint-enable camelcase */

Template.paymentSettings.onCreated(async function () {
  this.state = new ReactiveDict();
  this.state.setDefault({ shopId: null, paymentMethods: [] });

  const [shopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);
  const { paymentMethods } = await simpleGraphQLClient.queries.paymentMethods({ shopId });
  this.state.set({ shopId, paymentMethods });
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
    const response = await simpleGraphQLClient.mutations.enablePaymentMethodForShop({
      input: {
        shopId: state.get("shopId"),
        paymentMethodName: event.target.getAttribute("data-name"),
        isEnabled: event.target.checked
      }
    });
    const paymentMethods = _.get(response, "enablePaymentMethodForShop.paymentMethods");
    state.set("paymentMethods", paymentMethods);
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
