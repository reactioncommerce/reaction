import { Accounts } from "meteor/accounts-base";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import { LoginFormSharedHelpers } from "/client/modules/accounts/helpers";
import { UpdatePasswordOverlayContainer } from "/client/modules/accounts/containers";

/**
 * Accounts Event: onResetPasswordLink When a user uses a password reset link
 */
Accounts.onResetPasswordLink((token, done) => {
  Blaze.renderWithData(Template.loginFormUpdatePasswordOverlay, {
    token: token,
    callback: done,
    isOpen: true
  }, $("body").get(0));
});

/**
 * Accounts Event: onEnrollmentLink When a user uses an enrollment link
 */
Accounts.onEnrollmentLink((token, done) => {
  Blaze.renderWithData(Template.loginFormUpdatePasswordOverlay, {
    token: token,
    callback: done,
    isOpen: true
  }, $("body").get(0));
});

/**
 * Accounts Event: onEmailVerificationLink When a user uses an verification link
 */
Accounts.onEmailVerificationLink(function (token, done) {
  Accounts.verifyEmail(token);
  done();
});

// ----------------------------------------------------------------------------
// /**
//  * Helpers: Login Form Update Password Overlay
//  */
Template.loginFormUpdatePasswordOverlay.helpers({
  component() {
    const currentData = Template.currentData() || {};
    return {
      ...currentData,
      component: UpdatePasswordOverlayContainer
    };
  }
});

// ----------------------------------------------------------------------------

/**
 * onCreated: Login Form Change Password
 */
Template.loginFormChangePassword.onCreated(() => {
  const template = Template.instance();

  template.uniqueId = Random.id();
  template.formMessages = new ReactiveVar({});
});

/**
 * Helpers: Login Form Change Password
 */
Template.loginFormChangePassword.helpers(LoginFormSharedHelpers);

/**
 * Events: Login Form Change Password
 */
Template.loginFormChangePassword.events({

  /**
   * Submit form for password update
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "submit form": function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    const oldPasswordInput = template.$(".login-input--oldPassword");
    const passwordInput = template.$(".login-input--password");

    const oldPassword = oldPasswordInput.val().trim();
    const password = passwordInput.val().trim();

    // We only check if it exists, just incase we"ve change the password strength and want the
    // user to have an oppurtinity to update to a stronger password
    const validatedOldPassword = LoginFormValidation.password(password, { validationLevel: "exists" });
    const validatedPassword = LoginFormValidation.password(password);

    const templateInstance = Template.instance();
    const errors = {};

    templateInstance.formMessages.set({});


    if (validatedOldPassword !== true) {
      errors.oldPassword = validatedOldPassword;
    }

    if (validatedPassword !== true) {
      errors.password = validatedPassword;
    }

    if ($.isEmptyObject(errors) === false) {
      templateInstance.formMessages.set({
        errors: errors
      });
      // prevent password update
      return;
    }

    Accounts.changePassword(oldPassword, password, (error) => {
      if (error) {
        // Show some error message
        templateInstance.formMessages.set({
          alerts: [error]
        });
      } else {
        // // Close dropdown or navigate to page
        templateInstance.formMessages.set({
          info: [{
            reason: i18next.t("accountsUI.info.passwordChanged")
          }]
        });
      }
    });
  }
});
