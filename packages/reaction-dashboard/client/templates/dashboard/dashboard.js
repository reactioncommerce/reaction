
Template.activePkgGrid.helpers({
  UserConfig: function () {
        return UserConfig.find({$or: [
        {metafields: {type: 'core'}},
        {metafields: {type: ''}}
    ]}).map(function (parentCategory) {
        return _.extend(parentCategory,
            {children: UserConfig.find({"metafields.type": parentCategory.name}).fetch()});
    });
  }
});



Template.activePkgGrid.rendered = function () {
  var pkgGrid = new Packery(document.querySelector('.pkg-container'), {
    gutter: 2
  });
};



Template.availablePkgGrid.helpers({
    // returns all registered reaction packages
    ReactionPackages: function () {
        return ReactionPackages.find({ $and: [
            {"metafields.type": {$not: 'core'}},
            {"metafields.visible": {$not: 'nav'}}
        ]});
    }
});

Template.availablePkgGrid.rendered = function () {
  var pkgGrid2 = new Packery(document.querySelector('.apps-container'), {
    gutter: 2
  });
};



// *****************************************************
// Enable or disable packages
// Enable adds to reaction_config, sets enabled = true
// disable just sets enabled flag to false
// *****************************************************
Template.pkg.helpers({
    // returns enabled status for this user for specific package
    enabledPackage: function (packageId) {
        return UserConfig.find({packageId: packageId}).count() > 0;
    }
});

Template.pkg.events({
    'click .enablePkg': function (event, template) {
        event.preventDefault();

        ReactionConfig.insert({userId: Meteor.userId(), packageId: this._id, name: this.name, label: this.label, enabled: true, metafields: this.metafields});
        $.gritter.add({title: 'Enabled Package', text: this.label + ' is now enabled.'});
        if (this.route) Router.go(this.route);
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

