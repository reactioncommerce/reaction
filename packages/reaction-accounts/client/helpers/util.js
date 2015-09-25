
var capitalize = function(str){
  str = str == null ? '' : String(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
};

ReactionServiceHelper = class ReactionServiceHelper {

  construct() {}

  availableServices() {

    let services = Package['accounts-oauth'] ? Accounts.oauth.serviceNames() : [];
    services.sort();

    return services;
  }

  capitalizedServiceName(name) {
    if (name === "meteor-developer") {
      return "MeteorDeveloperAccount"
    } else {
      return capitalize(name);
    }
  }

  configFieldsForService(name) {
    let capitalizedName = this.capitalizedServiceName(name);
    let template = Template[`configureLoginServiceDialogFor${capitalizedName}`];

    if (template) {
      let fields = template.fields();

      return _.map(fields, (field) => {

        if (!field.type) {
          field.type = (field.property === "secret") ? "password" : "text"
        }

        return _.extend(field, {
          type: field.type
        });
      });
    }

    return [];
  }

  services(extendEach) {

    let services = this.availableServices();

    return _.map(services, (name) => {

      let serviceName = this.capitalizedServiceName(name);

      var thing = {
        name: name,
        label: this.capitalizedServiceName(name),
        fields: this.configFieldsForService(name)
      };

      if (_.isFunction(extendEach)) {
        thing = _.extend(thing, extendEach(thing) || {})
      }

      return thing

    });

  }
}
