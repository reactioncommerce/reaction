import _ from "lodash";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";
import { ReactiveDict } from "meteor/reactive-dict";
import { Shops } from "/lib/collections";

Template.paymentSettings.onCreated(async function () {
  this.state = new ReactiveDict();
  this.state.setDefault({ shopId: null, paymentMethods: [] });

  const [shopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);
  const { paymentMethods } = await simpleGraphQLClient.queries.paymentMethods({ shopId });
  this.state.set({ paymentMethods, shopId });
});

Template.paymentSettings.helpers({
  paymentPlugins() {
    const plugins = Reaction.Apps({ provides: "paymentSettings" });

    // Omit discounts, which we have a separate template for
    return plugins.filter(({ packageName }) => packageName !== "discount-codes");
  },
  paymentMethodOptions() {
    const options = [{ label: "Auto", value: "none" }];

    // This should return true payment methods only, i.e., not the discounts method.
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
  paymentMethodsForPlugin() {
    const paymentMethods = Template.instance().state.get("paymentMethods");
    if (!Array.isArray(paymentMethods)) return [];

    return paymentMethods.filter((method) => method.pluginName === this.packageName);
  },
  shop() {
    return Shops.findOne(Reaction.getShopId());
  }
});

// toggle payment methods visibility
Template.paymentSettings.events({
  async "change input[name=paymentMethodEnabled]"(event) {
    event.preventDefault();

    const { state } = Template.instance();
    const isEnabled = event.target.checked;

    const response = await simpleGraphQLClient.mutations.enablePaymentMethodForShop({
      input: {
        shopId: state.get("shopId"),
        paymentMethodName: this.name,
        isEnabled
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

// Handle legacy discount codes payment method
Template.discountsPaymentSettings.helpers({
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
  }
});

Template.discountsPaymentSettings.events({
  "change input[name=enabled]"(event) {
    event.preventDefault();

    const isEnabled = event.target.checked;
    const fields = [{
      property: "enabled",
      value: isEnabled
    }];

    Meteor.call("registry/update", this.packageId, this.settingsKey, fields);
    Meteor.call("shop/togglePackage", this.packageId, !isEnabled);
  }
});
