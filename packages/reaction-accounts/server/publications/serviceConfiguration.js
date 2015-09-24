

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
  if (Roles.userIsInRole(this.userId, ['owner', 'admin'], Roles.GLOBAL_GROUP)) {
    return ServiceConfiguration.configurations.find({}, {
      fields: {
        "secret": 1
      }
    });
  // shop admin gets accouns for just this shop
  }

  return ServiceConfiguration.configurations.find({}, {
    fields: {
      "secret": 0
    }
  });
});
