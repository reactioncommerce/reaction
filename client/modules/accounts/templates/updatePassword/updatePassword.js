import { Accounts } from "meteor/accounts-base";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import { LoginFormSharedHelpers } from "/client/modules/accounts/helpers";

/**
 * Accounts Event: onResetPasswordLink When a user uses a password reset link
 */
Accounts.onResetPasswordLink((token, done) => {
  Blaze.renderWithData(Template.loginFormUpdatePasswordOverlay, {
    token: token,
    callback: done
  }, $("body").get(0));
});

/**
 * Accounts Event: onEnrollmentLink When a user uses an enrollment link
 */
Accounts.onEnrollmentLink((token, done) => {
  Blaze.renderWithData(Template.loginFormUpdatePasswordOverlay, {
    token: token,
    callback: done
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

/**
 * onCreated: Login Form Update Password Overlay
 */
Template.loginFormUpdatePasswordOverlay.onCreated(() => {
  const template = Template.instance();

  template.uniqueId = Random.id();
  template.formMessages = new ReactiveVar({});
});

/**
 * Helpers: Login Form Update Password Overlay
 */
Template.loginFormUpdatePasswordOverlay.helpers(LoginFormSharedHelpers);

/**
 * Events: Login Form Update Password Overlay
 */
Template.loginFormUpdatePasswordOverlay.events({

  /**
   * Close modal
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "click .close, click .cancel": (event, template) => {
    Blaze.remove(template.view);
  },

  /**
   * Submit form within modal - onSubmit reset password if validation is successful
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "submit form": (event, template) => {
    event.preventDefault();
    event.stopPropagation();

    const passwordInput = template.$(".login-input--password");
    const password = passwordInput.val().trim();
    const validatedPassword = LoginFormValidation.password(password);

    const templateInstance = Template.instance();
    const errors = {};

    templateInstance.formMessages.set({});

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

    Accounts.resetPassword(template.data.token, password, (error) => {
      if (error) {
        // Show some error message
        templateInstance.formMessages.set({
          alerts: [error]
        });
      } else {
        // Close dropdown or navigate to page
        template.data.callback();

        Blaze.remove(template.view);
      }
    });
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
    const validatedOldPassword = LoginFormValidation.password(password, {validationLevel: "exists"});
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
