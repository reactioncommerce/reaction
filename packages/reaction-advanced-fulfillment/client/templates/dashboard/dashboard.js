function pullOrders(date, timeLength) {
  let rawDate = new Date(date);
  let dayStart = moment(rawDate).startOf(timeLength)._d;
  let dayEnd = moment(rawDate).endOf(timeLength)._d;
  let orders =  ReactionCore.Collections.Orders.find({
    'advancedFulfillment.workflow.status': {
      $in: [
        'orderCreated',
        'orderPrinted',
        'orderPicking',
        'orderPicked',
        'orderPacking',
        'orderPacked',
        'orderReadyToShip',
        'orderShipped'
      ]
    },
    'advancedFulfillment.shipmentDate': {
      $gte: new Date(dayStart),
      $lte: new Date(dayEnd)
    }
  }).fetch();
  return _.countBy(orders, function (order) {
    return order.advancedFulfillment.workflow.status;
  });
}

Template.dashboardAdvancedFulfillmment.helpers({
  chosenDate: function () {
    Session.setDefault('chosenDate', moment().format('MM/DD/YYYY'));
    return Session.get('chosenDate');
  },
  chosenDateText: function () {
    return moment(Session.get('chosenDate'), 'MM/DD/YYYY').calendar(null, AdvancedFulfillment.calendarReferenceTime);
  },
  dateToday: function () {
    return moment().format('MM-DD-YYYY');
  },
  todaysOrdersExist: function () {
    let rawDate = new Date();
    let dayStart = moment(rawDate).startOf('day')._d;
    let dayEnd = moment(rawDate).endOf('day')._d;
    let allOfTodaysOrders = ReactionCore.Collections.Orders.find({
      'advancedFulfillment.workflow.status': {
        $in: [
          'orderCreated',
          'orderPrinted',
          'orderPicking',
          'orderPicked',
          'orderPacking',
          'orderPacked',
          'orderReadytoShip',
          'orderShipped'
        ]
      },
      'advancedFulfillment.shipmentDate': {
        $gte: new Date(dayStart),
        $lte: new Date(dayEnd)
      }
    }).count();
    if (allOfTodaysOrders > 0) {
      return true;
    }
    return false;
  },
  todaysOrders: function () {
    return pullOrders(new Date(), 'day');
  },
  thisWeeksOrders: function () {
    return pullOrders(new Date(), 'week');
  },
  tomorrowsOrder: function () {
    let date = moment(new Date()).add(1, 'day');
    return pullOrders(date, 'day');
  },
  yesterdaysOrders: function () {
    let date = moment(new Date()).subtract(1, 'day');
    return pullOrders(date, 'day');
  },
  thisMonthsOrders: function () {
    return pullOrders(new Date(), 'month');
  }
});

Template.dashboardAdvancedFulfillmment.events({
  'blur #print-date': function (event) {
    let date = event.currentTarget.value;
    Session.set('chosenDate', date);
  },
  'click .print-specific-date': function (event) {
    event.preventDefault();
    let chosenDate = Session.get('chosenDate');
    let date = moment(chosenDate, 'MM-DD-YYYY');
    let date2 = moment(chosenDate, 'MM-DD-YYYY');
    let startDate = date.startOf('day').toDate();
    let endDate = date2.endOf('day').toDate();
    if (date.isValid()) {
      Meteor.call('advancedFulfillment/printInvoices', startDate, endDate, Meteor.userId());
      window.open(window.location.origin + Router.path('orders.printAllForDate', {date: date.format('MM-DD-YYYY')}));
    } else {
      Alerts.removeSeen();
      Alerts.add('please select a valid date', 'danger', {
        autoHide: true
      });
    }
  }
});

Template.dashboardAdvancedFulfillmment.onRendered(function () {
  $('#print-date').datepicker();

  let width = 960,
      height = 500,
      radius = Math.min(width, height) / 2 - 10;
  let rawDate = new Date();
  let dayStart = moment(rawDate).startOf('day')._d;
  let dayEnd = moment(rawDate).endOf('day')._d;
  let allOfTodaysOrders = ReactionCore.Collections.Orders.find({
    'advancedFulfillment.workflow.status': {
      $in: [
        'orderCreated',
        'orderPrinted',
        'orderPicking',
        'orderPicked',
        'orderPacking',
        'orderPacked',
        'orderReadyToShip',
        'orderShipped'
      ]
    },
    'advancedFulfillment.shipmentDate': {
      $gte: new Date(dayStart),
      $lte: new Date(dayEnd)
    }
  }).fetch();

  let orderByStatus = _.countBy(allOfTodaysOrders, function (order) {
    return order.advancedFulfillment.workflow.status;
  });

  let data = [
    orderByStatus.orderCreated     || 0,
    orderByStatus.orderPrinted     || 0,
    orderByStatus.orderPicking     || 0,
    orderByStatus.orderPicked      || 0,
    orderByStatus.orderPacking     || 0,
    orderByStatus.orderPacked      || 0,
    orderByStatus.orderReadyToShip || 0,
    orderByStatus.orderShipped     || 0
  ];


  // let color = d3.scale.category10();
  let color = d3.scale.ordinal()
  .range([
    '#000000', // Black - orderCreated
    '#808080', // Gray - orderPrinted
    '#EE4043', // Red - orderPicking
    '#f69fa1', // Pink - orderPicked
    '#FABA61', // orange - orderPacking
    'fde3bf', // light organge - orderPacked
    '#FDF6AF', // light yellow - orderReadytoShip
    '#429544' // green -'orderShipped'
  ]);
  let arc = d3.svg.arc()
      .outerRadius(radius);

  let pie = d3.layout.pie();

  let svg = d3.select('.d3').append('svg')
      .datum(data)
      .attr('width', width)
      .attr('height', height)
    .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  let arcs = svg.selectAll('g.arc')
      .data(pie)
    .enter().append('g')
      .attr('class', 'arc');

  arcs.append('path')
      .attr('fill', function(d, i) { return color(i); })
    .transition()
      .ease('bounce')
      .duration(2000)
      .attrTween('d', tweenPie)
    .transition()
      .ease('elastic')
      .delay(function(d, i) { return 2000 + i * 50; })
      .duration(750)
      .attrTween('d', tweenDonut);

  function tweenPie(b) {
    b.innerRadius = 0;
    let i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
    return function(t) { return arc(i(t)); };
  }

  function tweenDonut(b) {
    b.innerRadius = radius * .6;
    let i = d3.interpolate({innerRadius: 0}, b);
    return function(t) { return arc(i(t)); };
  }
})
