Template.activePkgGrid.helpers({
  UserConfig: function () {
    return UserConfig.find({metafields: {type: ''}}).map(function (parentCategory) {
      return _.extend(parentCategory,
        {children: UserConfig.find({"metafields.type": parentCategory.name}).fetch()});
    });
  },
  hasUserConfig: function () {
    if (UserConfig.find({metafields: {type: ''}}).count() > 0) return true;
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
