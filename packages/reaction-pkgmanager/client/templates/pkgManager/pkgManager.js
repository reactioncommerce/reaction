// *****************************************************
// Template package manager
// Displays packages that have register.js data
//
// metafields.type
//
//    - empty will enablable and will shop as top level navigation
//    - package name (as defined in register.js)
//      will make package appear as subnav item
//    - items marked as 'core' will not appear,
//      but will automatically enabled
//
// metafields.visible
//    - has value, then won't display
//    - value is name of template that the value will be made available
//    - ie: dashboardSideNav will appear as a sub item, and will be
//      enabled and disabled dependant on metafields.type package
//
// *****************************************************

Template.pkgManager.helpers({
    // returns all registered reaction packages
    ReactionPackages: function () {
        return ReactionPackages.find({ $and: [
            {"metafields.type": {$not: 'core'}},
            {"metafields.visible": {$not: 'nav'}}
        ]});
    },
    // returns enabled status for this user for specific package
    enabledPackage: function (packageId) {
        return UserConfig.find({packageId: packageId}).count() > 0;
    },
    //
    // Function that randomly picks colors for package tiles
    // returns random color
    //
    tileColors: function () {
        var colors = ['blue', 'light-blue', 'dark-blue', 'red', 'orange', 'magenta', 'lime', 'yellow', 'pink', 'aqua', 'fuchsia', 'gray', 'maroon', 'olive', 'purple', 'teal', 'green'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
});

// *****************************************************
// Enable or disable packages
// Enable adds to reaction_config, sets enabled = true
// disable just sets enabled flag to false
// *****************************************************
Template.pkgManager.events({
    'click .enablePkg': function (event, template) {
        event.preventDefault();

        ReactionConfig.insert({userId: Meteor.userId(), packageId: this._id, name: this.name, label: this.label, enabled: true, metafields: this.metafields});
        $.gritter.add({title: 'Enabled Package', text: this.label + ' is now enabled.'});
        Router.go(this.route);
    },
    'click .disablePkg': function (event, template) {
        event.preventDefault();

        var disablePkg = ReactionConfig.find({userId: Meteor.userId(), packageId: this._id, name: this.name, enabled: true});
        disablePkg.forEach(function (pkg) {
            ReactionConfig.update({_id: pkg._id}, {$set: {enabled: false}});
            $.gritter.add({title: 'Disabled Package', text: pkg.label + ' is now disabled.'});
        });
    }
});
