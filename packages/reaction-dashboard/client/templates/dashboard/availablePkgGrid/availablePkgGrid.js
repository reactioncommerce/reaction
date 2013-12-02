Template.availablePkgGrid.helpers({
  availablePkgs: function () {
    return Meteor.app.packages;
  }
});

Template.availablePkgGrid.rendered = function () {
//  $('.app-gallery').hide();
};

Template.availablePkgGrid.events({
  "click .selector": function (e, template) {

  }
});
