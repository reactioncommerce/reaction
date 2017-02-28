import _ from "lodash";
import { Template } from "meteor/templating";
import { Accounts } from "/lib/collections";
import { Reaction } from "/client/api";
import { TaxEntityCodes } from "/client/collections";

Template.taxSettingsPanel.helpers({
  account() {
    if (Reaction.Subscriptions.Account.ready()) {
      return Accounts.findOne({
        userId: Meteor.userId()
      });
    }
    return null;
  },
  entityCodes() {
    return _.concat(TaxEntityCodes.find().map((entityCode) => {
      return _.assign({}, entityCode, {
        label: entityCode.name,
        value: entityCode.code
      });
    }), [
      {
        label: "SET CUSTOM VALUE",
        value: "CUSTOM USER INPUT"
      }
    ]);
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
  this.autorun(() => {
    this.subscribe("Account");
  });

  Meteor.call("avalara/getEntityCodes", (error, entityCodes) => {
    _.each(entityCodes, (entityCode) => {
      TaxEntityCodes.insert(entityCode);
    });
  });
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
