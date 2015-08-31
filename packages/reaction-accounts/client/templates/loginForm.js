// ============================================================================
// Login form
//
//

var swapViews = function (template, newView) {
  if( template.currentView ) {
    Blaze.remove(template.currentView)
  }

  template.currentView = Blaze.render(Template[newView], template.$('.loginForm')[0])
}


// XXX from http://epeli.github.com/underscore.string/lib/underscore.string.js
var capitalize = function(str){
  str = str == null ? '' : String(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
};


LoginFormValidation = {
  username: function(username) {

    // Valid
    if (username.length >= 3) {
      return true;
    }

    // Invalid
    return {
      "error": "INVALID_USERNAME",
      "reason": "Username must be at least 3 characters long"
    };
  },

  email: function(email, optional) {

    email = email.trim();

    // Valid
    if (optional === true && email.length === 0) {
      return true;
    } else if (email.indexOf('@') !== -1) {
      return true;
    }

    // Invalid
    return {
      error: "INVALID_EMAIL",
      reason: i18n.t('accountsUI.error.invalidEmail')
    };

  },

  password: function(password, options) {

    // Must have one number and/or symbol
    var validPasswordRegex = /^.*(?=.*[a-z])(?=.*[\d\W]).*$/;
    options = options || {};

    // Only check if a password has been entered at all.
    // This is usefull for the login forms
    if (options.validationLevel === 'exists') {
      if (password.length > 0) {
        return true;
      } else {
        return {
          error: "INVALID_PASSWORD",
          reason: i18n.t('accountsUI.error.passwordRequired')
        };
      }
    }

    // ---
    // Validate the password pased on some rules
    // This is useful for cases where a password needs to be created or updated.
    //

    var errors = [];

    if (password.length < 6) {
      errors.push({
        error: "INVALID_PASSWORD",
        reason: i18n.t('accountsUI.error.passwordMustBeAtLeast6CharactersLong')
      });
    }

    if (password.match(validPasswordRegex) === null) {
      errors.push({
        error: "INVALID_PASSWORD",
        reason: i18n.t('accountsUI.error.passwordMustContainRequirements')
      });
    }


    if (errors.length) {
      return errors;
    }

    // Otherwise the password is valid
    return true
  }
};

LoginFormSharedHelpers = {

  messages: function() {
    return Template.instance().formMessages.get();
  },

  hasError: function(error) {

    // True here means the field is valid
    // We're checking if theres some other message to display
    if (error !== true && typeof error !== 'undefined') {
      return 'has-error has-feedback';
    }

    return false;
  },

  formErrors: function () {
    return Template.instance().formErrors.get();
  },

  uniqueId: function() {
    return Template.instance().uniqueId;
  },


  services: function () {

    var services = Package['accounts-oauth'] ? Accounts.oauth.serviceNames() : [];
    services.sort();

    return _.map(services, function (name) {
      return {
        name: name,
        buttonType: Template.instance().type || 'signIn'
      };
    });

  },

  shouldShowSeperator: function () {
    return !!Package['accounts-password'] && Accounts.oauth.serviceNames().length
  },

  hasPasswordService: function () {
    return ( !!Package['accounts-password'] )
  }


};


// ----------------------------------------------------------------------------
// Login Form helpers
//

Template.loginForm.helpers({

  // **************************************************************************
  // Dynamic template name for view switching
  //
  loginFormCurrentView: function () {
    return Template.instance().loginFormCurrentView.get();
  },

  uniqueId: function() {
    return Template.instance().uniqueId;
  }

});



// ----------------------------------------------------------------------------
// Login Form:: Created
//
Template.loginForm.onCreated(function () {

  var startView = 'loginFormSignInView';

  if (this.data) {
    if (this.data.startView) {
      startview = this.data.startview;
    }
  }

  this.loginFormCurrentView = new ReactiveVar(startView);
  this.uniqueId = Random.id();
  this.credentials = {};
});




// ----------------------------------------------------------------------------
// Login Form events
// These events are shared across all login form views and subviews
//
Template.loginForm.events({


  // **************************************************************************
  // Show the sign in view
  //
  'click .action--signIn': function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    this.email = template.$('.login-input--email').val();
    this.password = template.$('.login-input--password').val();

    template.loginFormCurrentView.set('loginFormSignInView')
  },


  // **************************************************************************
  // Show the sign in view
  //
  'click .action--signUp': function (event, template) {
    event.preventDefault();
    event.stopPropagation();


    this.email = template.$('.login-input--email').val();
    this.password = template.$('.login-input--password').val();

    template.loginFormCurrentView.set('loginFormSignUpView')
  },


  // **************************************************************************
  // Show the password reset view
  //
  'click .action--forgot': function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    this.email = template.$('.login-input--email').val();
    this.password = template.$('.login-input--password').val();

    template.loginFormCurrentView.set('loginFormResetPasswordView')
  },




  // **************************************************************************
  // Sign in with a OAuth provider (e.g. facebook, google+, etc)
  //
  'click .action--signInWithProvider': function (event, template) {
    var serviceName = capitalize(this.name);
    // loginButtonsSession.resetMessages();

    // XXX Service providers should be able to specify their
    // `Meteor.loginWithX` method name.

    if (serviceName === 'meteor-developer') {
      serviceName = 'MeteorDeveloperAccount'
    }

    var loginWithService = Meteor["loginWith" + serviceName];

    var options = {}; // use default scope unless specified

    // TODO: update or remove
    // if (Accounts.ui._options.requestPermissions[serviceName]) {
    //   options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
    // }

    // if (Accounts.ui._options.requestOfflineToken[serviceName]) {
    //   options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[serviceName];
    // }

    // if (Accounts.ui._options.forceApprovalPrompt[serviceName]) {
    //   options.forceApprovalPrompt = Accounts.ui._options.forceApprovalPrompt[serviceName];
    // }

    loginWithService(options, function (err) {
      //loginResultCallback(serviceName, err);
      Meteor.call("layout/pushWorkflow", "coreCartWorkflow", "checkoutLogin");
    });

  }

})
