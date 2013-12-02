Template.activePkgGrid.helpers({
  PackageConfigs: function () {
    return PackageConfigs.find({metafields: {type: ''}}).map(function (parentCategory) {
      return _.extend(parentCategory,
        {children: PackageConfigs.find({"metafields.type": parentCategory.name}).fetch()});
    });
  },
  hasPackageConfigs: function () {
    if (PackageConfigs.find({metafields: {type: ''}}).count() > 0) return true;
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
