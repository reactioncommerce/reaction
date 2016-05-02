import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";


Meteor.methods({
  "accounts/updateServiceConfiguration": function (service, fields) {
    check(service, String);
    check(fields, Array);
    const dataToSave = {};

    _.each(fields, function (field) {
      dataToSave[field.property] = field.value;
    });

    if (Reaction.hasPermission(["dashboard/accounts"])) {
      return ServiceConfiguration.configurations.upsert({
        service: service
      }, {
        $set: dataToSave
      });
    }
    return false;
  }
});
