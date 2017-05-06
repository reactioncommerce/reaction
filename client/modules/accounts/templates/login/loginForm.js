import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { LoginContainer } from "../../containers";

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
  component() {
    const currentData = Template.currentData() || {};
    return {
      ...currentData,
      component: LoginContainer
    };
  },

  /**
   * Login form data
   * @return {Object} Object containing data for the current login form view.
   */
  loginFormData() {
    return {
      credentials: Template.instance().credentials
    };
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
