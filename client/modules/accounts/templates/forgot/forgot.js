import { i18next } from "/client/api";
import { LoginFormSharedHelpers } from "/client/modules/accounts/helpers";
import { Template } from "meteor/templating";

Template.loginFormResetPasswordView.events({

  /**
   * Submit the password reset form
   * @param {Event} event - jQuery Event
   * @param {Object} template - Blaze Template
   * @return {void}
   */
  "submit form": (event, template) => {
    event.preventDefault();

    let emailAddress = template.$(".login-input-email").val().trim();
    let validatedEmail = LoginFormValidation.email(emailAddress);
    let templateInstance = Template.instance();
    let errors = {};

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

    Accounts.forgotPassword({ email: emailAddress}, (error) => {
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
  let template = Template.instance();

  template.uniqueId = Random.id();
  template.formMessages = new ReactiveVar({});
});


Template.loginFormResetPasswordView.helpers(LoginFormSharedHelpers);
