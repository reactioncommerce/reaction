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
      return true;;
    } else if (email.indexOf('@') !== -1) {
      return true;
    }

    // Invalid
    return {
      error: "INVALID_EMAIL",
      reason: "Not a valid email address"
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
          reason: 'Please enter a valid password'
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
        reason: 'Password must be at least 6 characters long'
      });
    }

    if (password.match(validPasswordRegex) === null) {
      errors.push({
        error: "INVALID_PASSWORD",
        reason: 'Password must contain at least one number or symbol'
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

  errors: function(name) {
    return Template.instance().formErrors.get();
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
  this.loginFormCurrentView = new ReactiveVar('loginFormSignInView');
  this.uniqueId = Random.id();


  Random.id();
  console.log('would be random id', Random.id())

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

    template.loginFormCurrentView.set('loginFormSignInView')
  },


  // **************************************************************************
  // Show the sign in view
  //
  'click .action--signUp': function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    template.loginFormCurrentView.set('loginFormSignUpView')
  },


  // **************************************************************************
  // Show the password reset view
  //
  'click .action--forgot': function (event, template) {

    event.preventDefault();
    event.stopPropagation();

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

    if (Accounts.ui._options.requestPermissions[serviceName]) {
      options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
    }

    if (Accounts.ui._options.requestOfflineToken[serviceName]) {
      options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[serviceName];
    }

    if (Accounts.ui._options.forceApprovalPrompt[serviceName]) {
      options.forceApprovalPrompt = Accounts.ui._options.forceApprovalPrompt[serviceName];
    }

    loginWithService(options, function (err) {
      loginResultCallback(serviceName, err);
    });

  }

})


