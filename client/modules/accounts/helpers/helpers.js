import { Template } from "meteor/templating";
import {
  ForgotContainer
} from "../containers";

export const LoginFormSharedHelpers = {
  forgotComponent() {
    return ForgotContainer;
  },

  messages: function () {
    return Template.instance().formMessages.get();
  },

  hasError(error) {
    // True here means the field is valid
    // We're checking if theres some other message to display
    if (error !== true && typeof error !== "undefined") {
      return "has-error has-feedback";
    }
  }
};
