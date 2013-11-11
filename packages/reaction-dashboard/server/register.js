Meteor.startup(function () {
    console.log("Adding Dashboard to modules");
    ReactionPackages.update({
        name: "reaction-dashboard",
        label: "Dashboard",
        description: "Core Reaction Dashboard",
        icon: "fa fa-tachometer fa-5x",
        route: "/dashboard",
        template: "dashboard",
        priority: "1",
        metafields: {type: 'core'}
    }, {$set: {}}, {upsert: true});
});
