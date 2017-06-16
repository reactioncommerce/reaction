import { Template } from "meteor/templating";

export const LoginFormSharedHelpers = {
  messages: function () {
    return Template.instance().formMessages.get();
  },

  hasError(error) {
    // True here means the field is valid
    // We're checking if theres some other message to display
    if (error !== true && typeof error !== "undefined") {
      return "has-error has-feedback";
    }
  },
  capitalize: function (str) {
    const finalString = str === null ? "" : String(str);
    return finalString.charAt(0).toUpperCase() + finalString.slice(1);
  }
};
