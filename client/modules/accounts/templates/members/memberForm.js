import { Reaction, i18next } from "/client/api";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Alerts as AlertsComponent } from "/imports/plugins/core/ui/client/components";
import { ReactiveDict } from "meteor/reactive-dict";


Template.memberForm.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.set("error", false);
  this.state.set("errorMessage", "");
});

/**
 * memberForm events
 *
 */
Template.memberForm.events({
  "submit form": function (event, template) {
    event.preventDefault();

    const newMemberEmail = template.$('input[name="email"]').val();
    const newMemberName = template.$('input[name="name"]').val();

    return Meteor.call("accounts/inviteShopMember", Reaction.getShopId(),
      newMemberEmail, newMemberName, function (error, result) {
        if (error) {
          let message;
          if (error.reason === "Unable to send invitation email.") {
            message = i18next.t("accountsUI.error.unableToSendInvitationEmail");
          } else if (error.reason === "A user with this email address already exists") {
            message = i18next.t("accountsUI.error.userWithEmailAlreadyExists");
          } else if (error.reason !== "") {
            message = error;
          } else {
            message = `${i18next.t("accountsUI.error.errorSendingEmail")
              } ${error}`;
          }

          template.state.set("errorMessage", message);

          template.$("input[type=text], input[type=email]").val("");

          return template.state.set("error", true);
        }
        if (result) {
          Alerts.toast(i18next.t("accountsUI.info.invitationSent",
            "Invitation sent."), "success");

          template.$("input[type=text], input[type=email]").val("");
          $(".settings-account-list").show();

          return true;
        }
      }
    );
  }
});

/**
 * memberForm helpers
 *
 */
Template.memberForm.helpers({
  inviteError() {
    const instance = Template.instance();
    return instance.state.get("error");
  },
  errorMessage() {
    const instance = Template.instance();
    const errorMessage = instance.state.get("errorMessage");
    const alerts = [
      {
        message: errorMessage,
        mode: "warning",
        options: {
          autoHide: 4000
        }
      }
    ];
    return alerts;
  },
  inlineAlert() {
    return AlertsComponent;
  }
});
