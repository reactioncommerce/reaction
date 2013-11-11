Meteor.startup(function () {
  console.log("Adding HelloWorld to modules");
  // Upsert the package document
  // There can only be one
  var result = ReactionPackages.upsert({
    name: "reaction-helloworld"
  }, {
    $set: {
      label: "HelloWorld",
      description: "Example Reaction Package",
      icon: "fa fa-globe fa-5x",
      route: "/helloworld",
      template: "helloworld",
      priority: "2"
    }
  });
  // Add the fields that are modifiable from user interface
  // Only if package has just been inserted
  if (result.insertedId) {
    ReactionPackages.update(result.insertedId, {
      $set: {
        metafields: {type:'reaction-pkgmanager'}
      }
    })
  }
});
