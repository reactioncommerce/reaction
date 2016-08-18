import { LoginFormSharedHelpers } from "/client/modules/accounts/helpers";
import { Template } from "meteor/templating";

/**
 * onCreated: Login form sign up view
 */
Template.loginFormSignUpView.onCreated(() => {
  let template = Template.instance();

  template.uniqueId = Random.id();
  template.formMessages = new ReactiveVar({});
  template.type = "signUp";
});

/**
 * Helpers: Login form sign up view
 */
Template.loginFormSignUpView.helpers(LoginFormSharedHelpers);

/**
 * Events: Login form sign up view
 */
Template.loginFormSignUpView.events({
  /**
   * Submit sign up form
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "submit form": function (event, template) {
    event.preventDefault();

    // var usernameInput = template.$(".login-input--username");
    let emailInput = template.$(".login-input-email");
    let passwordInput = template.$(".login-input-password");

    let email = emailInput.val().trim();
    let password = passwordInput.val().trim();

    let validatedEmail = LoginFormValidation.email(email);
    let validatedPassword = LoginFormValidation.password(password);

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
      // prevent signup
      return;
    }

    let newUserData = {
      // username: username,
      email: email,
      password: password
    };

    Accounts.createUser(newUserData, function (error) {
      if (error) {
        // Show some error message
        templateInstance.formMessages.set({
          alerts: [error]
        });
      } else {
        // Close dropdown or navigate to page
      }
    });
  }
});
