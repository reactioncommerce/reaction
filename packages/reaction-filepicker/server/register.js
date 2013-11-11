Meteor.startup(function () {
  console.log("Adding Reaction Filepicker.io to packages");
  ReactionPackages.update({
    name: "reaction-filepicker",
    label: "Filepicker.io",
    description: "<a href='http://filepicker.io' target='_blank' class='dashlink'>Filepicker.io</a> for Reaction",
    icon: "fa fa-cloud-upload fa-5x",
    route: "/filepicker-io",
    template: "filepicker-io",
    priority: "9",
    metafields: {type: 'reaction-pkgmanager', apikey: ''}
  }, {$set: {}}, {upsert: true});
});
