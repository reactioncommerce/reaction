import _ from "lodash";
import { ServiceConfigHelper } from "./util";
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

    return false;
  },

  formErrors() {
    return Template.instance().formErrors.get();
  },

  uniqueId: function () {
    return Template.instance().uniqueId;
  },

  services() {
    const serviceHelper = new ServiceConfigHelper();
    return serviceHelper.services();
  },

  shouldShowSeperator() {
    const serviceHelper = new ServiceConfigHelper();
    const services = serviceHelper.services();
    const enabledServices = _.filter(services, {
      enabled: true
    });

    return !!Package["accounts-password"] && enabledServices.length > 0;
  },

  hasPasswordService() {
    return !!Package["accounts-password"];
  }
};
