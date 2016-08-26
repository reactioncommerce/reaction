import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

// ============================================================================
// Login form
//
//

// XXX from http://epeli.github.com/underscore.string/lib/underscore.string.js
function capitalize(str) {
  const finalString = str === null ? "" : String(str);
  return finalString.charAt(0).toUpperCase() + finalString.slice(1);
}


// ----------------------------------------------------------------------------
// Login Form helpers
//

Template.loginForm.helpers({

  /**
   * Login form current view
   * @return {String} Name of the template to use as the current view.
   */
  loginFormCurrentView() {
    return Template.instance().loginFormCurrentView.get();
  },

  /**
   * Login form data
   * @return {Object} Object containing data for the current login form view.
   */
  loginFormData() {
    return {
      credentials: Template.instance().credentials
    };
  },

  /**
   * Unique id to use on form elements
   * @return {String} String of the unique ID for the current template
   */
  uniqueId() {
    return Template.instance().uniqueId;
  }

});

/**
 * Login form onCreated
 */
Template.loginForm.onCreated(function () {
  const template = Template.instance();
  const currentData = Template.currentData();
  let startView = "loginFormSignInView";

  if (currentData) {
    if (currentData.startView) {
      startView = currentData.startView;
    }
  }

  template.loginFormCurrentView = new ReactiveVar(startView);
  template.uniqueId = Random.id();
  template.credentials = {};
});

/**
 * Login Form events
 * These events are shared across all login form views and subviews
 */
Template.loginForm.events({

  /**
   * Event: Show sign in view
   * @param  {Event}    event    jQuery Event
   * @param  {Template} template Blaze Template instance
   * @return {void}
   */
  "click [data-event-action=signIn]": function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    template.credentials = {
      email: template.$(".login-input-email").val(),
      password: template.$(".login-input-password").val()
    };

    template.loginFormCurrentView.set("loginFormSignInView");
  },

  /**
   * Event: Show the sign up (register) view
   * @param  {Event}    event    jQuery Event
   * @param  {Template} template Blaze Template instance
   * @return {void}
   */
  "click [data-event-action=signUp]": (event, template) => {
    event.preventDefault();
    event.stopPropagation();

    template.credentials = {
      email: template.$(".login-input-email").val(),
      password: template.$(".login-input-password").val()
    };

    template.loginFormCurrentView.set("loginFormSignUpView");
  },

  /**
   * Event: Show the password reset view
   * @param  {Event}    event    jQuery Event
   * @param  {Template} template Blaze Template instance
   * @return {void}
   */
  "click [data-event-action=forgotPassword]": (event, template) => {
    event.preventDefault();
    event.stopPropagation();

    template.credentials = {
      email: template.$(".login-input-email").val(),
      password: template.$(".login-input-password").val()
    };

    template.loginFormCurrentView.set("loginFormResetPasswordView");
  }
});

/**
 * Service sign in button helpers
 */
Template.loginFormServiceButton.events({

  /**
   * Event: Click (click on the service button to sign in / sign up)
   * @param  {Event}    event    jQuery Event
   * @param  {Template} template Blaze Template instance
   * @return {void}
   */
  "click button": (event, template) => {
    let serviceName = template.data.name;

    // Get proper service name
    if (serviceName === "meteor-developer") {
      serviceName = "MeteorDeveloperAccount";
    } else {
      serviceName = capitalize(serviceName);
    }

    const loginWithService = Meteor["loginWith" + serviceName];
    const options = {}; // use default scope unless specified

    loginWithService(options, () => {
      // TODO: add error message for failed login attempt
    });
  }
});
