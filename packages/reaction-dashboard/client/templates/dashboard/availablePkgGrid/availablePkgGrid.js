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
//  $('.app-gallery').hide();
};

Template.availablePkgGrid.events({
  "click .selector": function (e, template) {

  }
});
