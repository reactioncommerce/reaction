"use strict";

window.LoginFormSharedHelpers = {

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
    let services = new ReactionServiceHelper();
    return services.services();
  },

  shouldShowSeperator: function () {
    return !!Package['accounts-password'] && Accounts.oauth.serviceNames().length
  },

  hasPasswordService: function () {
    return ( !!Package['accounts-password'] )
  }


};
