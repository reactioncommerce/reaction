Template.afNavbar.onCreated(function () {
  // this.subscribe('searchOrders');
});

Template.afNavbar.onRendered(function () {
  $('.navbar-primary-tags').hide();
});

Template.afNavbar.helpers({
  todaysDate: function () {
    return moment().format('MM-DD-YYYY');
  },
  tomorrowsDate: function () {
    return moment().add(1, 'days').format('MM-DD-YYYY');
  },
  yesterdaysDate: function () {
    return moment().subtract(1, 'days').format('MM-DD-YYYY');
  },
  missingItemsFromOrder: function () {
    return ReactionCore.Collections.Orders.find({
      itemMissingDetails: true
    }).count();
  },
  impossibleDates: function () {
    return ReactionCore.Collections.Orders.find({
      'advancedFulfillment.impossibleShipDate': true
    }).count();
  },
  missingRentalDates: function () {
    return ReactionCore.Collections.Orders.find({
      infoMissing: true,
      $or: [{
        startTime: {$exists: false}
      }, {
        endTime: {$exists: false}
      }, {
        rentalDays: {$exists: false}
      }]
    }).count();
  },
  missingBundleInfo: function () {
    return ReactionCore.Collections.Orders.find({
      bundleMissingColor: true
    }).count();
  },
  getOrders: function () {
    return OrderSearch.getData();
  }
});

Template.afNavbar.events({
  'submit .subnav-search-form, submit .navbar-search-form': function (event) {
    event.preventDefault();
    let searchValue = event.target.orderNumber.value;
    let order = null;
    OrderSearch.search(searchValue);
    // let order = ReactionCore.Collections.Orders.findOne({$or: [{_id: searchValue}, {shopifyOrderNumber: parseInt(searchValue, 10)}]});
    if (OrderSearch.getStatus() === 'loaded') {
      order = OrderSearch.getData()[0];
      Router.go('orderDetails', {_id: order._id});
    } else {
      setTimeout(function () {
        order = OrderSearch.getData()[0];
        if (order) {
          Router.go('orderDetails', {_id: order._id});
        } else {
          Alerts.removeSeen();
          Alerts.add(searchValue + ' is not a valid order number or order id, please try your search again.', 'danger', {
            autoHide: true
          });
        }
      }, 500);
    }
  },
  'click #afShipButton': function (event) {
    event.preventDefault();
    let unfilteredDate = $('#afShipInput').val();
    let verifiedDate = moment(unfilteredDate, 'MM-DD-YYYY').isValid();
    if (verifiedDate) {
      let date = moment(unfilteredDate, 'MM-DD-YYYY').format('MM-DD-YYYY');
      Router.go('dateShipping', {date: date});
    }
  },
  'click #afLocalDeliveryButton': function (event) {
    event.preventDefault();
    let unfilteredDate = $('#afLocalDeliveryInput').val();
    let verifiedDate = moment(unfilteredDate, 'MM-DD-YYYY').isValid();
    if (verifiedDate) {
      let date = moment(unfilteredDate, 'MM-DD-YYYY').format('MM-DD-YYYY');
      Router.go('dateLocalDelivery', {date: date});
    }
  },
  'click #afReturnButton': function (event) {
    event.preventDefault();
    let unfilteredDate = $('#afReturnInput').val();
    let verifiedDate = moment(unfilteredDate, 'MM-DD-YYYY').isValid();
    if (verifiedDate) {
      let date = moment(unfilteredDate, 'MM-DD-YYYY').format('MM-DD-YYYY');
      Router.go('dateReturning', {date: date});
    }
  }
});
