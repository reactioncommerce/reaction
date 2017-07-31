import { Meteor } from "meteor/meteor";
import $ from "jquery";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { MarketplacePackageConfig } from "../../../lib/collections/schemas";


/**
 * marketplaceSettings helpers
 *
 */
Template.marketplaceSettings.helpers({
  MarketplacePackageConfig() {
    return MarketplacePackageConfig;
  },

  packageData() {
    return Packages.findOne({
      name: "reaction-marketplace",
      shopId: Reaction.getPrimaryShopId()
    });
  }
});

/**
 * marketplace Catalog settings
 */
Template.marketplaceShopSettings.inheritsHelpersFrom("marketplaceSettings");

Template.inviteUser.events({
  "click [data-event-action=inviteUser]": function (e) {
    e.preventDefault();
    const name = $("#owner-name").val();
    const email = $("#owner-email").val();

    Meteor.call("accounts/inviteShopOwner", { name, email }, (error, result) => {
      if (error) {
        let message;
        if (error.reason === "Unable to send invitation email.") {
          message = i18next.t("accountsUI.error.unableToSendInvitationEmail");
        } else if (error.reason === "A user with this email address already exists") {
          message = i18next.t("accountsUI.error.userWithEmailAlreadyExists");
        } else if (error.reason !== "") {
          message = error;
        } else {
          message = `${i18next.t("accountsUI.error.errorSendingEmail")} ${error}`;
        }

        Alerts.inline(message, "error", { placement: "memberform" });
        $("#owner-name").val("");
        $("#owner-email").val("");
        return false;
      }

      if (result) {
        Alerts.toast(i18next.t("accountsUI.info.invitationSent", "Invitation sent."), "success");
        $("#owner-name").val("");
        $("#owner-email").val("");
        return true;
      }
    });
  }
});

/**
 * marketplaceSettings autoform alerts
 */

AutoForm.hooks({
  marketplaceOptionsForm: {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.settings.dashboardMarketplaceSettingsSaved"),
        "success");
    },
    onError(operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.settings.dashboardMarketplaceSettingsFailed")} ${error}`, "error"
      );
    }
  }
});
