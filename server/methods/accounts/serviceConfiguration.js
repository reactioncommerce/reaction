Meteor.methods({
  "accounts/updateServiceConfiguration": function (service, fields) {
    check(service, String);
    check(fields, Array);
    const dataToSave = {};

    _.each(fields, function (field) {
      dataToSave[field.property] = field.value;
    });

    if (ReactionCore.hasPermission(["dashboard/accounts"])) {
      return ServiceConfiguration.configurations.upsert({
        service: service
      }, {
        $set: dataToSave
      });
    }
    return false;
  }
});
