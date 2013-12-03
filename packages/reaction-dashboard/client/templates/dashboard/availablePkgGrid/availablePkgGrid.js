Template.availablePkgGrid.helpers({
  availablePkgs: function () {
    return Meteor.app.packages;
  }
});

Template.availablePkgGrid.rendered = function () {
  var pkgGrid = new Packery(document.querySelector('.apps-container'), {gutter: 2});
};

Template.availablePkgGrid.events({
  "click .selector": function (e, template) {

  }
});
