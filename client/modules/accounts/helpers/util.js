
function capitalize(str) {
  let finalString = str === null ? "" : String(str);
  return finalString.charAt(0).toUpperCase() + str.slice(1);
}

ReactionServiceHelper = class ReactionServiceHelper {

  construct() {}

  availableServices() {
    let services = Package["accounts-oauth"] ? Accounts.oauth.serviceNames() : [];
    services.sort();

    return services;
  }

  capitalizedServiceName(name) {
    if (name === "meteor-developer") {
      return "MeteorDeveloperAccount";
    }

    return capitalize(name);
  }

  configFieldsForService(name) {
    let capitalizedName = this.capitalizedServiceName(name);
    let template = Template[`configureLoginServiceDialogFor${capitalizedName}`];

    if (template) {
      let fields = template.fields();

      return _.map(fields, (field) => {
        if (!field.type) {
          field.type = field.property === "secret" ? "password" : "text";
        }

        return _.extend(field, {
          type: field.type
        });
      });
    }

    return [];
  }

  services(extendEach) {
    let availableServices = this.availableServices();
    let configurations = ServiceConfiguration.configurations.find().fetch();

    return _.map(availableServices, (name) => {
      let matchingConfigurations = _.where(configurations, {service: name});
      let service = {
        name: name,
        label: this.capitalizedServiceName(name),
        fields: this.configFieldsForService(name)
      };

      if (matchingConfigurations.length) {
        service = _.extend(service, matchingConfigurations[0]);
      }

      if (_.isFunction(extendEach)) {
        service = _.extend(service, extendEach(service) || {});
      }

      return service;
    });
  }
};
