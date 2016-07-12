import _ from "lodash";
import { Template } from "meteor/templating";

function capitalize(str) {
  const finalString = str === null ? "" : String(str);
  return finalString.charAt(0).toUpperCase() + str.slice(1);
}

export class ServiceConfigHelper {

  availableServices() {
    const services = Package["accounts-oauth"] ? Accounts.oauth.serviceNames() : [];
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
    const capitalizedName = this.capitalizedServiceName(name);
    const template = Template[`configureLoginServiceDialogFor${capitalizedName}`];

    if (template) {
      const fields = template.fields();

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
    const availableServices = this.availableServices();
    const configurations = ServiceConfiguration.configurations.find().fetch();

    return _.map(availableServices, (name) => {
      const matchingConfigurations = _.filter(configurations, {service: name});
      let service = {
        name,
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
}
