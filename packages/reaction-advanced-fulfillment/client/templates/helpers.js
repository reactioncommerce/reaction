Template.registerHelper('displayOrderNumber', (order) => {
  if (order.shopifyOrderId) {
    return '<a href="http://getoutfitted.myshopify.com/admin/orders/'
    + order.shopifyOrderId
    + '">Order #' + order.shopifyOrderNumber + '</a>';
  } else if (order.shopifyOrderNumber) {
    return 'Order #' + order.shopifyOrderNumber;
  }

  // Default
  return 'Order #' + order._id;
});

Template.registerHelper('formattedDate', (date) => {
  return moment(date).calendar(null, AdvancedFulfillment.shippingCalendarReference);
});

Template.registerHelper('formatInputDate', (date) => {
  return moment(date).format('MM/DD/YYYY');
});

Template.registerHelper('formattedRange', (start, end) => {
  return moment(start).twix(end, {allDay: true}).format({
    monthFormat: 'MMMM',
    dayFormat: 'Do'
  });
});


Template.registerHelper('pastDate', (date) => {
  check(date, Date);
  return new Date() > moment(date).startOf('day').add(16, 'hours');
});

Template.registerHelper('hasCustomerServiceIssue', (order) => {
  let anyIssues = [
    order.infoMissing,
    order.itemMissingDetails,
    order.bundleMissingColor,
    order.advancedFulfillment.impossibleShipDate,
    order.advancedFulfillment.items.length === 0
  ];
  return _.some(anyIssues);
});
