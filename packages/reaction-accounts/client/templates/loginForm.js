"use strict";

// ============================================================================
// Login form
//
//


// XXX from http://epeli.github.com/underscore.string/lib/underscore.string.js
var capitalize = function(str){
  str = str == null ? '' : String(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
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
//   "click [data-event-action=signInWithProvider]": (event, template) => {

//     let data = Template.currentData();
//     let serviceName;

//     if (this.name === "meteor-developer") {
//       serviceName = "MeteorDeveloperAccount"
//     } else {
//       serviceName = capitalize(this.name);
//     }
// console.log("loginWith", data, Template.instance())
//     var loginWithService = Meteor["loginWith" + serviceName];

//     var options = {}; // use default scope unless specified

//     // TODO: update or remove
//     // if (Accounts.ui._options.requestPermissions[serviceName]) {
//     //   options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
//     // }

//     // if (Accounts.ui._options.requestOfflineToken[serviceName]) {
//     //   options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[serviceName];
//     // }

//     // if (Accounts.ui._options.forceApprovalPrompt[serviceName]) {
//     //   options.forceApprovalPrompt = Accounts.ui._options.forceApprovalPrompt[serviceName];
//     // }

//     loginWithService(options, function (err) {
//       //loginResultCallback(serviceName, err);
//     });

//   }

})


Template.loginFormServiceButton.events({

  "click button": (event, template) => {

    let serviceName = template.data.name;

    if (serviceName === "meteor-developer") {
      serviceName = "MeteorDeveloperAccount"
    } else {
      serviceName = capitalize(serviceName);
    }

    console.log(serviceName)

    var loginWithService = Meteor["loginWith" + serviceName];

    var options = {}; // use default scope unless specified

    loginWithService(options, function (err) {
      //loginResultCallback(serviceName, err);
      if (err) {
        console.log(`Could not sign in with ${serviceName}`, err)
      }
    });
  }
})
