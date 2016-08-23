import { LoginFormSharedHelpers } from "/client/modules/accounts/helpers";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

/**
 * onCreated: Login form sign in view
 */
Template.loginFormSignInView.onCreated(() => {
  const template = Template.instance();

  template.uniqueId = Random.id();
  template.formMessages = new ReactiveVar({});
});

/**
 * Helpers: Login form sign in view
 */
Template.loginFormSignInView.helpers(LoginFormSharedHelpers);

/**
 * Events: Login form sign in view
 */
Template.loginFormSignInView.events({

  /**
   * Submit sign in form
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "submit form": (event, template) => {
    event.preventDefault();

    const usernameInput = template.$(".login-input-email");
    const passwordInput = template.$(".login-input-password");

    const username = usernameInput.val().trim();
    const password = passwordInput.val().trim();

    const validatedEmail = LoginFormValidation.email(username);
    const validatedPassword = LoginFormValidation.password(password, {validationLevel: "exists"});

    const templateInstance = Template.instance();
    const errors = {};

    templateInstance.formMessages.set({});

    if (validatedEmail !== true) {
      errors.email = validatedEmail;
    }

    if (validatedPassword !== true) {
      errors.password = validatedPassword;
    }

    if ($.isEmptyObject(errors) === false) {
      templateInstance.formMessages.set({
        errors: errors
      });

      // prevent password reset
      return;
    }

    Meteor.loginWithPassword(username, password, (error) => {
      if (error) {
        // Show some error messages above the form fields
        templateInstance.formMessages.set({
          alerts: [error]
        });
      } else {
        // Close dropdown or navigate to page
      }
    });
  }
});
