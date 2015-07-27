
Template.loginFormSignInView.events({
  // *******************************************************
  // Submit the sign in form
  //
  'click .action--submit': function (event, template) {
    var options = {};

    console.log(template);

    var usernameInput = template.$('.login-input--email');
    var passwordInput = template.$('.login-input--password');

    var username = usernameInput.val().trim()
    var password = passwordInput.val().trim()

    var validatedEmail = LoginFormValidation.email(username);
    var validatedPassword = LoginFormValidation.password(password, {validationLevel: 'exists'});

    var errors = {};

    if (validatedEmail !== true ) {
      errors.email = validatedEmail.reason;
    }

    // if (validatedPassword !== true) {
    //   errors.password = validatedPassword.reason;
    // }

    if ($.isEmptyObject(errors) === false) {
      Template.instance().formErrors.set(errors);
// console.log(errors)
      // prevent login
      return;
    }

    Meteor.loginWithPassword(username, password, function(error, result) {
      if( error ) {
        // Show some error message
        console.log(error)
      } else {
        // Close dropdown or navigate to page
      }

    });
  }

});


Template.loginFormSignInView.onCreated(function() {
  this.uniqueId = Random.id();
  this.formErrors = new ReactiveVar({})
})


Template.loginFormSignInView.helpers({
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
  },

  currentStateIs: function (state) {
    return this.currentState === state;
  },

  // ::PLUCKED and modified from accounts-ui-unstyled ::
  services: function () {
    var self = this;

    // First look for OAuth services.
    var services = Package['accounts-oauth'] ? Accounts.oauth.serviceNames() : [];
    console.log(services, Accounts.oauth.serviceNames())
    // Be equally kind to all login services. This also preserves
    // backwards-compatibility. (But maybe order should be
    // configurable?)
    services.sort();

    // Add password, if it's there; it must come last.
    // if( !!Package['accounts-password'] ) {
    //   services.push('password');
    // }

    return _.map(services, function (name) {
      return {name: name};
    });

  },

  shouldShowSeperator: function () {
    return !!Package['accounts-password'] && Accounts.oauth.serviceNames().length
  },

  hasPasswordService: function () {
    return ( !!Package['accounts-password'] )
  }

  // configured: function () {
  //   return !!ServiceConfiguration.configurations.findOne({service: this.name});
  // },
  // capitalizedName: function () {
  //   if (this.name === 'github')
  //     // XXX we should allow service packages to set their capitalized name
  //     return 'GitHub';
  //   else if (this.name === 'meteor-developer')
  //     return 'Meteor';
  //   else
  //     return capitalize(this.name);
  // }



  // validateUsername = function(email) {
  //   if( email.indexOf('@') !== -1 ) {
  //     return true
  //   }

  //   return false
  // }

})


