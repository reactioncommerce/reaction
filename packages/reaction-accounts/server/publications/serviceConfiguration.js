

// var serviceFieldConfigurations = {
//   // Pulled from
//   "github": [
//     {property: 'clientId', label: 'Client ID'},
//     {property: 'secret', label: 'Client Secret'}
//   ]
// }




Meteor.publish('ServiceConfiguration', function (userId) {

  check(userId, Match.OneOf(String, null));

  // global admin can get all accounts
  if (ReactionCore.hasPermission(["dashboard/accounts"])) {
    return ServiceConfiguration.configurations.find({}, {
      fields: {
        "secret": 1,
        "enabled": 1
      }
    });
  // shop admin gets accouns for just this shop
  }

  return ServiceConfiguration.configurations.find({}, {
    fields: {
      "secret": 0,
      "enabled": 1
    }
  });
});
