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

Template.registerHelper("getGravatar", function (currentUser, size) {
  const options = {
    secure: true,
    size: size,
    default: "identicon"
  };
  const user = currentUser || Accounts.user();
  if (typeof user !== "object") return false;
  const account = ReactionCore.Collections.Accounts.findOne(user._id);
  // first we check picture exists. Picture has higher priority to display
  if (account && account.profile && account.profile.picture) {
    return account.profile.picture;
  }
  if (user.emails && user.emails.length === 1) {
    const email = user.emails[0].address;
    return Gravatar.imageUrl(email, options);
  }
});

/**
 * registerHelper displayName
 */
Template.registerHelper("displayName", function (displayUser) {
  const user = displayUser || Accounts.user();
  if (user) {
    if (user.profile && user.profile.name) {
      return user.profile.name;
    } else if (user.username) {
      return user.username;
    }

    // todo: previous check was user.services !== "anonymous", "resume". Is this
    // new check covers previous check?
    if (Roles.userIsInRole(user._id, "account/profile",
      ReactionCore.getShopId())) {
      return i18next.t("accountsUI.guest", {defaultValue: "Guest"});
    }
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
        return i18next.t("accountsUI.guest", {defaultValue: "Guest"});
      }
    })();
    return username;
  }
  return i18next.t("accountsUI.signIn", {defaultValue: "Sign in"});
});
