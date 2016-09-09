import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import { LoginFormSharedHelpers } from "/client/modules/accounts/helpers";

Template.loginFormResetPasswordView.events({

  /**
   * Submit the password reset form
   * @param {Event} event - jQuery Event
   * @param {Object} template - Blaze Template
   * @return {void}
   */
  "submit form": (event, template) => {
    event.preventDefault();

    const emailAddress = template.$(".login-input-email").val().trim();
    const validatedEmail = LoginFormValidation.email(emailAddress);
    const templateInstance = Template.instance();
    const errors = {};

    templateInstance.formMessages.set({});

    if (validatedEmail !== true) {
      errors.email = validatedEmail;
    }

    if ($.isEmptyObject(errors) === false) {
      templateInstance.formMessages.set({
        errors: errors
      });
      // prevent password reset
      // return;
    }

    Meteor.call("accounts/sendResetPasswordEmail", { email: emailAddress }, (error) => {
      // Show some message confirming result
      if (error) {
        templateInstance.formMessages.set({
          alerts: [error]
        });
      } else {
        templateInstance.formMessages.set({
          info: [{
            reason: i18next.t("accountsUI.info.passwordResetSend") || "Password reset mail sent."
          }]
        });
      }
    });
  }

});

/**
 * loginFormResetPasswordView
 *
 */
Template.loginFormResetPasswordView.onCreated(() => {
  const template = Template.instance();

  template.uniqueId = Random.id();
  template.formMessages = new ReactiveVar({});
});


Template.loginFormResetPasswordView.helpers(LoginFormSharedHelpers);
