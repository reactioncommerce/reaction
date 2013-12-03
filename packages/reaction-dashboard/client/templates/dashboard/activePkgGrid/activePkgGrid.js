Template.activePkgGrid.helpers({
  PackageConfigs: function () {
    var packageConfigs = PackageConfigs.find().fetch();
    _.each(packageConfigs, function(packageConfig) {
      _.each(Meteor.app.packages, function(packageInfo) {
        if (packageInfo.name == packageConfig.name) {
          _.extend(packageConfig, packageInfo)
        }
      })
    });
    return  packageConfigs;
  },
  hasPackageConfigs: function () {
    return PackageConfigs.find().count();
  }
});

Template.activePkgGrid.rendered = function () {
  var pkgGrid = new Packery(document.querySelector('.pkg-container'), {gutter: 2});
};


Template.activePkgGrid.events({
  'click .tile-gallery': function () {
    $(".app-gallery").toggle();
    var appGrid = new Packery(document.querySelector('.apps-container'), {gutter: 2});
  }
});
