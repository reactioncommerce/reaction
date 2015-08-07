

ModalHelper = {
  closeModal: function (template) {
    Blaze.remove(template.view);
  }
}


Accounts.onResetPasswordLink(function (token, done) {
  Router.go('/update-password');

  Blaze.renderWithData(Template.loginFormUpdatePasswordOverlay, {
    token: token,
    callback: done
  }, $('body').get(0))


});

Accounts.onEnrollmentLink(function (token, done) {

  Blaze.renderWithData(Template.loginFormUpdatePasswordOverlay, {
    token: token,
    callback: done
  }, $('body').get(0));

});

Accounts.onEmailVerificationLink(function (token, done) {
  Accounts.verifyEmail(token);
  done();
  // Post some kind of global, but non blocking alert notification
});


// ----------------------------------------------------------------------------

Template.loginFormUpdatePasswordOverlay.onCreated(function() {
  this.uniqueId = Random.id();
  this.formErrors = new ReactiveVar({})
})

Template.loginFormUpdatePasswordOverlay.helpers(LoginFormSharedHelpers);
Template.loginFormUpdatePasswordOverlay.helpers({
  close: function () {

  }
});

Template.loginFormUpdatePasswordOverlay.events({

  'submit form': function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    var self = this;
    var passwordInput = template.$('.login-input--password');
    var password = passwordInput.val().trim()
    var validatedPassword = LoginFormValidation.password(password);

    var errors = {};

    if (validatedPassword !== true) {
      errors.password = validatedPassword;
    }

    if ($.isEmptyObject(errors) === false) {
      Template.instance().formErrors.set(errors);
      // prevent password update
      return;
    }

    Accounts.resetPassword(this.token, password, function(error, result) {
      if( error ) {
        // Show some error message

        Template.instance().formErrors.set({
          'alert': [{
            reason: error.reason
          }]
        });
      } else {
        // Close dropdown or navigate to page
        self.callback();
      }

    });
  }

});


// ----------------------------------------------------------------------------

Template.loginFormChangePassword.onCreated(function() {
  this.uniqueId = Random.id();
  this.formErrors = new ReactiveVar({})
})

Template.loginFormChangePassword.helpers(LoginFormSharedHelpers);

Template.loginFormChangePassword.events({

  'submit form': function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    var self = this;
    var oldPasswordInput = template.$('.login-input--oldPassword');
    var passwordInput = template.$('.login-input--password');

    var oldPassword = oldPasswordInput.val().trim()
    var password = passwordInput.val().trim()

    // We only check if it exists, just incase we've change the password strength and want the
    // user to have an oppurtinity to update to a stronger password
    var validatedOldPassword = LoginFormValidation.password(password, {validationLevel: 'exists'});
    var validatedPassword = LoginFormValidation.password(password);

    var errors = {};

    if (validatedOldPassword !== true) {
      errors.oldPassword = validatedOldPassword;
    }

    if (validatedPassword !== true) {
      errors.password = validatedPassword;
    }

    if ($.isEmptyObject(errors) === false) {
      Template.instance().formErrors.set(errors);
      // prevent password update
      return;
    }

    Accounts.changePassword(oldPassword, password, function(error, result) {
      if( error ) {
        // Show some error message

        Template.instance().formErrors.set({
          'alert': [{
            reason: error.reason
          }]
        });
      } else {
        // // Close dropdown or navigate to page
        // self.callback();
      }

    });
  }

});
