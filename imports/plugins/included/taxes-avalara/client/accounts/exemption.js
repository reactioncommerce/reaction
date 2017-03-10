import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Packages, Accounts } from "/lib/collections";
import { Accounts as AccountsSchema } from "/lib/collections/schemas/accounts";
import { TaxEntityCodes } from "/client/collections";

Template.taxSettingsPanel.helpers({
  account() {
    const sub = Meteor.subscribe("UserAccount", this.member.userId);
    if (sub.ready()) {
      return Accounts.findOne({ _id: this.member.userId });
    }
    return null;
  },
  makeUniqueId() {
    return `tax-settings-form-${this.member.userId}`;
  },
  accountsSchema() {
    return AccountsSchema;
  },
  entityCodes() {
    const customOption = [{
      label: i18next.t("admin.taxSettings.entityCodeCustomLabel"),
      value: "CUSTOM USER INPUT"
    }];

    const entityCodes = TaxEntityCodes.find().map((entityCode) => {
      return Object.assign({}, entityCode, {
        label: entityCode.name,
        value: entityCode.code
      });
    });

    return (entityCodes || []).concat(customOption);
  }
});

Template.taxSettingsPanel.events({
  "change [data-event-action=customType]": function (event) {
    event.stopPropagation();

    if (isCustomValue()) {
      return $(".customerUsageType").toggleClass("hide");
    }
    $(".customerUsageType").addClass("hide");
  }
});

Template.taxSettingsPanel.onCreated(function () {
  const avalaraPackage = Packages.findOne({
    name: "taxes-avalara",
    shopId: Reaction.getShopId()
  });
  const isAvalaraEnabled = _.get(avalaraPackage, "settings.avalara.enabled", false);
  const currentCodes = TaxEntityCodes.find().fetch();

  if (isAvalaraEnabled && !currentCodes.length) {
    Meteor.call("avalara/getEntityCodes", (error, entityCodes) => {
      if (error) {
        return Alerts.toast(
          `${i18next.t("settings.apiError")} ${error.message}`, "error"
        );
      }
      (entityCodes || []).forEach((entityCode) => TaxEntityCodes.insert(entityCode));
    });
  }
});

AutoForm.hooks({
  "tax-settings-form": {
    before: {
      update: function (doc) {
        if (isCustomValue()) {
          const value = $(".customerUsageType input").val();
          doc.$set["taxSettings.customerUsageType"] = value;
        }
        return doc;
      }
    }
  }
});

function isCustomValue() {
  const formData = AutoForm.getFormValues("tax-settings-form");
  const value = _.get(formData, "insertDoc.taxSettings.customerUsageType");
  return value === "CUSTOM USER INPUT";
}
