window.LoginFormSharedHelpers = {

  messages: function () {
    return Template.instance().formMessages.get();
  },

  hasError(error) {
    // True here means the field is valid
    // We're checking if theres some other message to display
    if (error !== true && typeof error !== "undefined") {
      return "has-error has-feedback";
    }

    return false;
  },

  formErrors() {
    return Template.instance().formErrors.get();
  },

  uniqueId: function () {
    return Template.instance().uniqueId;
  },

  services() {
    let serviceHelper = new ReactionServiceHelper();
    return serviceHelper.services();
  },

  shouldShowSeperator() {
    let serviceHelper = new ReactionServiceHelper();
    let services = serviceHelper.services();
    let enabledServices = _.where(services, {
      enabled: true
    });

    return !!Package["accounts-password"] && enabledServices.length > 0;
  },

  hasPasswordService() {
    return !!Package["accounts-password"];
  }
};

/**
 * registerHelper displayName
 */
Template.registerHelper("displayName", function (displayUser) {
  let authenticated = false;
  const user = displayUser || Meteor.user();
  if (user) {
    if (user.profile && user.profile.name) {
      return user.profile.name;
    } else if (user.username) {
      return user.username;
    }

    if (user.services && user.services !== "anonymous" && user.services !== "resume") {
      authenticated = true;
    }

    if (authenticated === true) {
      let username = (function () {
        switch (false) {
        case !user.services.twitter:
          return user.services.twitter.name;
        case !user.services.google:
          return user.services.google.name;
        case !user.services.facebook:
          return user.services.facebook.name;
        case !user.services.instagram:
          return user.services.instagram.name;
        case !user.services.pinterest:
          return user.services.pinterest.name;
        default:
          return i18n.t("accountsUI.guest") || "Guest";
        }
      })();
      return username;
    }
    return i18n.t("accountsUI.signIn") || "Sign in";
  }
});

/**
 * registerHelper fName
 */

Template.registerHelper("fName", function (displayUser) {
  const user = displayUser || Meteor.user();
  if (user && user.profile && user.profile.name) {
    return user.profile.name.split(" ")[0];
  } else if (user && user.username) {
    return user.username.name.split(" ")[0];
  }
  if (user && user.services) {
    const username = (function () {
      switch (false) {
      case !user.services.twitter:
        return user.services.twitter.first_name;
      case !user.services.google:
        return user.services.google.given_name;
      case !user.services.facebook:
        return user.services.facebook.first_name;
      case !user.services.instagram:
        return user.services.instagram.first_name;
      case !user.services.pinterest:
        return user.services.pinterest.first_name;
      default:
        return i18n.t("accountsUI.guest") || "Guest";
      }
    })();
    return username;
  }
  return i18n.t("accountsUI.signIn") || "Sign in";
});
