import { LoginFormSharedHelpers } from "/client/modules/accounts/helpers";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

/**
 * onCreated: Login form sign in view
 */
Template.loginFormSignInView.onCreated(() => {
  let template = Template.instance();

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

    let usernameInput = template.$(".login-input-email");
    let passwordInput = template.$(".login-input-password");

    let username = usernameInput.val().trim();
    let password = passwordInput.val().trim();

    let validatedEmail = LoginFormValidation.email(username);
    let validatedPassword = LoginFormValidation.password(password, {validationLevel: "exists"});

    let templateInstance = Template.instance();
    let errors = {};

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
