


Meteor.methods({
  "accounts/updateServiceConfiguration": function (service, fields) {

    check(service, String);
    check(fields, Array);

    var dataToSave = {};

    _.each(fields, function(field) {
      dataToSave[field.property] = field.value
    });

    // let appId = event.target.appId.value
    // let secret = event.target.secret.value

    if (Roles.userIsInRole(this.userId, ['owner', 'admin'], Roles.GLOBAL_GROUP)) {
      return ServiceConfiguration.configurations.upsert({
        service: service
      }, {
        $set: dataToSave
      });
    }

    return false;
  }
})
