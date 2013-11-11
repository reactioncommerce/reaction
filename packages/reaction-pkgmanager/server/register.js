Meteor.startup(function () {
  console.log("Adding Package Manager to packages");
  ReactionPackages.update({
    name: "reaction-pkgmanager",
    label: "Packages",
    description: "Package Manager for Reaction",
    icon: "fa fa-puzzle-piece fa-5x",
    route: "/packages",
    template: "packageManager",
    priority: "9",
    metafields: {type: 'core'}
  }, {$set: {}}, {upsert: true});
});
