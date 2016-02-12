Template.dashboardRentalProductAvailability.helpers({
  skus: function () {
    let skus = _.filter(this.variants, function (variant) {
      return variant.sku;
    });
    return skus;
  }
});

Template.dashboardVariantAvailability.helpers({
  viewStart: Session.get('dashboardViewStart'),
  viewEnd: Session.get('dashboardViewEnd'),
  currentMonth: moment(Session.get('dashboardViewStart')).format('MMMM'),
  days: function () {
    Session.setDefault('dashboardViewStart', moment().startOf('month').toDate());
    Session.setDefault('dashboardViewEnd', moment().endOf('month').toDate());
    let viewStart = Session.get('dashboardViewStart');
    let viewEnd = Session.get('dashboardViewEnd');
    return moment(viewStart).twix(moment(viewEnd)).split(1, 'day');
  },
  inventoryVariants: function () {
    let variants = Template.parentData().variants;
    let _id = this._id;
    let inventoryVariants = _.filter(variants, function (variant) {
      return variant.parentId === _id;
    });
    if (inventoryVariants.length > 0) {
      return inventoryVariants;
    }
    return [this];
  },
  isDayBooked: function (day, unavailableDates) {
    if (unavailableDates.length === 0) {
      return 'hide';
    }
    let pos =  _.sortedIndex(unavailableDates, day.start.toDate());
    if (+day.start === +moment(unavailableDates[pos]).startOf('day')) {
      return 'success';
    }
    return 'hide';
  }
});

Template.dashboardCalendarDay.helpers({
  formattedDay: function (d) {
    return d.format('DD');
  },
  inventoryVariants: function () {
  }
});


Template.dashboardRentalProductAvailability.events({
  'click .viewPrevCalendar': function () {
    let viewMonth = moment(Session.get('dashboardViewStart')).subtract(1, 'month');
    let viewStart = moment(viewMonth).startOf('month').toDate();
    let viewEnd = moment(viewMonth).endOf('month').toDate();
    Session.set('dashboardViewStart', viewStart);
    Session.set('dashboardViewEnd', viewEnd);
  },
  'click .viewNextCalendar': function () {
    let viewMonth = moment(Session.get('dashboardViewStart')).add(1, 'month');
    let viewStart = moment(viewMonth).startOf('month').toDate();
    let viewEnd = moment(viewMonth).endOf('month').toDate();
    Session.set('dashboardViewStart', viewStart);
    Session.set('dashboardViewEnd', viewEnd);
  }
});
