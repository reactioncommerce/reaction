import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Accounts } from "/lib/collections";
import { Accounts as AccountsSchema } from "/lib/collections/schemas/accounts";
import { TaxEntityCodes } from "/client/collections";

Template.taxSettingsPanel.helpers({
  account() {
    const sub = Meteor.subscribe("Accounts.single", this.member.userId);
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
    return _.concat(TaxEntityCodes.find().map((entityCode) => {
      return _.assign({}, entityCode, {
        label: entityCode.name,
        value: entityCode.code
      });
    }), [{
      label: "SET CUSTOM VALUE",
      value: "CUSTOM USER INPUT"
    }]);
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
  const currentCodes = TaxEntityCodes.find().fetch();
  if (!currentCodes.length) {
    Meteor.call("avalara/getEntityCodes", (error, entityCodes) => {
      _.each(entityCodes, (entityCode) => {
        TaxEntityCodes.insert(entityCode);
      });
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
