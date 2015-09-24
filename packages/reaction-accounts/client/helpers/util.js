"use strict";

var capitalize = function(str){
  str = str == null ? '' : String(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
};

window.ReactionServiceHelper = class ReactionServiceHelper {

  construct() {}

  getAvailableServices() {

    let services = Package['accounts-oauth'] ? Accounts.oauth.serviceNames() : [];
    services.sort();

    return services;
  }

  getCapitalizedServiceName(name) {
    if (name === "meteor-developer") {
      return "MeteorDeveloperAccount"
    } else {
      return capitalize(name);
    }
  }

  getConfigFieldsForService(name) {
    let capitalizedName = this.getCapitalizedServiceName(name);
    let template = Template[`configureLoginServiceDialogFor${capitalizedName}`];

    if (template) {
      return template.fields().map((field) => {
        return _.extend(field, {
          type: (field.property === "secret") ? "password" : "text"
        });
      });
    }

    return [];
  }
}
