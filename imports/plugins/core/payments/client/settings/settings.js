import _ from "lodash";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { ReactiveDict } from "meteor/reactive-dict";
import { Shops } from "/lib/collections";

Template.paymentSettings.onCreated(async function () {
  this.state = new ReactiveDict();
  this.state.setDefault({ paymentMethods: [] });

  const [shopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);
  const { paymentMethods } = await simpleGraphQLClient.queries.paymentMethods({ shopId });
  this.state.set({ paymentMethods });
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
  shop() {
    return Shops.findOne(Reaction.getShopId());
  }
});

// toggle payment methods visibility
Template.paymentSettings.events({
  "change input[name=enabled]": (event) => {
    event.preventDefault();
    const settingsKey = event.target.getAttribute("data-key");
    const packageId = event.target.getAttribute("data-id");
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];
    // update package registry
    if (packageId) {
      Meteor.call("registry/update", packageId, settingsKey, fields);
      Meteor.call("shop/togglePackage", packageId, !event.target.checked);
    }
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
