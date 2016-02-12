Template.dashboardRentalProduct.helpers({
});

Template.dashboardRentalProduct.events({
  'click tr': function () {
    Router.go('dashboard.rentalProducts.availability', {_id: this._id});
  }
});
