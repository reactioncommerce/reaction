// *****************************************************
// Enable or disable packages
// Enable adds to reaction_config, sets enabled = true
// disable just sets enabled flag to false
// *****************************************************
Template.pkg.helpers({
  // returns enabled status for this user for specific package
  isEnabled: function (name) {
    return PackageConfigs.find({name: name}).count() > 0;
  }
});

Template.pkg.events({
  'click .enablePkg': function (event, template) {
    event.preventDefault();

    var pkg = PackageConfigs.findOne({name: this.name});
    if (!pkg) {
      PackageConfigs.insert({name: this.name});
      $.pnotify({title: 'Enabled package', text: this.label + ' is now enabled.', type: 'success'});
    }
    if (this.route) Router.go(this.route);
  },
  'click .disablePkg': function (event, template) {
    event.preventDefault();
    var pkg = PackageConfigs.findOne({name: this.name});
    PackageConfigs.remove(pkg._id);
    $.pnotify({title: 'Disabled Package', text: this.label + ' is now disabled.', type: 'success'});
  }
});
