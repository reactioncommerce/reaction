import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Packages, Accounts } from "/lib/collections";
import { Accounts as AccountsSchema } from "/lib/collections/schemas/accounts";
import { TaxEntityCodes } from "/client/collections";

let entityCodeList = [];
let currentAccount;

Template.taxSettingsPanel.onCreated(function () {
  this.subscribe("UserAccount", Meteor.userId());
});

Template.taxSettingsPanel.helpers({
  account() {
    if (Template.instance().subscriptionsReady()) {
      const account = Accounts.findOne(this.member.userId);
      currentAccount = account;
      return account;
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

    const entityCodes = TaxEntityCodes.find().map((entityCode) => Object.assign({}, entityCode, {
      label: entityCode.name,
      value: entityCode.code
    }));
    entityCodeList = (entityCodes || []).map((a) => a.code);
    return (entityCodes || []).concat(customOption);
  }
});

Template.taxSettingsPanel.events({
  "change [data-event-action=customType]"(event) {
    event.stopPropagation();
    const formId = $(event.currentTarget.closest("form")).attr("id");

    if (isCustomValue(formId)) {
      // show input field for custom; pre-fill with existing custom val
      const currType = _.get(currentAccount, "taxSettings.customerUsageType", "");
      if (entityCodeList.indexOf(currType) < 0) {
        $(".customerUsageType input").val(currType);
      }
      return $(".customerUsageType").toggleClass("hide");
    }

    $(".customerUsageType").addClass("hide");
  }
});

Template.taxSettingsPanel.onCreated(() => {
  const avalaraPackage = Packages.findOne({
    name: "taxes-avalara",
    shopId: Reaction.getShopId()
  });
  const isAvalaraEnabled = _.get(avalaraPackage, "settings.avalara.enabled", false);
  const currentCodes = TaxEntityCodes.find().fetch();

  if (isAvalaraEnabled && !currentCodes.length) {
    Meteor.call("avalara/getEntityCodes", (error, entityCodes) => {
      if (error) {
        return Alerts.toast(`${i18next.t("settings.apiError")} ${error.message}`, "error");
      }
      (entityCodes || []).forEach((entityCode) => TaxEntityCodes.insert(entityCode));
    });
  }
});

AutoForm.addHooks(null, {
  before: {
    update(doc) {
      const oldType = _.get(Template.instance(), "data.doc.taxSettings.customerUsageType");
      if (isCustomValue()) {
        const value = $(".customerUsageType input").val();
        doc.$set["taxSettings.customerUsageType"] = value;
      }
      if (oldType && entityCodeList.indexOf(oldType) < 0) {
        delete doc.$unset; // there's existing custom value.... this prevent autoform override
      }

      return doc;
    }
  }
});

/**
 * @summary Checks if customerUsageType is set to "custom"
 * @param {String} formId - Id of the Autoform instance..
 * @returns {boolean} - true if Custom Entity Type is set
 */
function isCustomValue(formId) {
  const formData = AutoForm.getFormValues(formId);
  const value = _.get(formData, "insertDoc.taxSettings.customerUsageType");
  return value === "CUSTOM USER INPUT";
}
