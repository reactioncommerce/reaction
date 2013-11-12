Meteor.startup(function () {
  console.log("Adding Greetramp to modules");
  ReactionPackages.update({
    name: "reaction-greetramp",
    label: "Greetramp",
    description: "Capture Emails on your site.",
    route: "greetramp",
    icon: "fa fa-road fa-5x",
    template: "greetramp",
    priority: "2",
    metafields: {type: ''}
  }, {$set: {}}, {upsert: true});
});
