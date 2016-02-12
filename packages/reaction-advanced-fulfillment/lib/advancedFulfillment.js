AdvancedFulfillment = {};

AdvancedFulfillment.humanActionStatuses = {
  'orderCreated': 'Print Order',
  'orderPrinted': 'Pick Order',
  'orderPicking': 'Pick Order',
  'orderPicked': 'Pack Order',
  'orderPacking': 'Pack Order',
  'orderPacked': 'Label Order',
  'orderReadyToShip': 'Ship Order',
  'orderShipped': 'Return Order',
  'orderReturned': 'Archive Order',
  'orderComplete': 'View Order',
  'orderIncomplete': 'View Order'
};

AdvancedFulfillment.humanOrderStatuses = {
  'orderCreated': 'Created',
  'orderPrinted': 'Printed',
  'orderPicking': 'Picking',
  'orderPicked': 'Picked',
  'orderPacking': 'Packing',
  'orderPacked': 'Packed',
  'orderReadyToShip': 'Labeled',
  'orderShipped': 'Shipped',
  'orderReturned': 'Returned',
  'orderCompleted': 'Complete',
  'orderIncomplete': 'Incomplete',
  'nonWarehouseOrder': 'nonWarehouseOrder',
  'orderCancelled': 'Cancelled'
};

AdvancedFulfillment.workflow = [
  'orderCreated',
  'orderPrinted',
  'orderPicking',
  'orderPicked',
  'orderPacking',
  'orderPacked',
  'orderReadyToShip',
  'orderShipped',
  'orderReturned'
];

AdvancedFulfillment.orderActive = [
  'orderCreated',
  'orderPrinted',
  'orderPicking',
  'orderPicked',
  'orderPacking',
  'orderPacked',
  'orderReadyToShip'
];

AdvancedFulfillment.orderShipping = [
  'orderCreated',
  'orderPrinted',
  'orderPicking',
  'orderPicked',
  'orderPacking',
  'orderPacked',
  'orderReadyToShip'
];

AdvancedFulfillment.orderInQueue = [
  'orderCreated',
  'orderPrinted',
  'orderPicking',
  'orderPicked',
  'orderPacking',
  'orderPacked',
  'orderReadyToShip',
  'orderShipped',
  'orderReturned'
];

AdvancedFulfillment.orderReturning = [
  'orderShipped',
  'orderReturned'
];

AdvancedFulfillment.orderArchivedStatus = [
  'orderComplete',
  'orderIncomplete'
];

AdvancedFulfillment.assignmentStatuses = ['orderPrinted', 'orderPicked',  'orderShipped'];
AdvancedFulfillment.nonAssignmentStatuses = ['orderCreated', 'orderPicking', 'orderPacking', 'orderPacked', 'orderReturned'];
AdvancedFulfillment.itemStatus = ['In Stock', 'picked', 'packed', 'shipped'];

AdvancedFulfillment.localDeliveryZipcodes = [
  '80424',
  '80435',
  '80443',
  '80497',
  '80498',
  '81657',
  '81620',
  '81657'
];

AdvancedFulfillment.calendarReferenceTime = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: '[This] dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'll'
};

AdvancedFulfillment.shippingCalendarReference = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'ddd MMM D, YYYY'
};

AdvancedFulfillment.dateFormatter = function (date) {
  return moment(date).format('MMMM Do, YYYY');
};


// fields definitions for publications and collection pulls
AdvancedFulfillment.fields = {};

AdvancedFulfillment.fields.ordersList = {
  '_id': 1,
  'shopifyOrderNumber': 1,
  'startTime': 1,
  'advancedFulfillment.returnDate': 1,
  'advancedFulfillment.shipmentDate': 1,
  'advancedFulfillment.workflow.status': 1,
  'advancedFulfillment.items._id': 1,
  'advancedFulfillment.items.workflow': 1,
  'advancedFulfillment.arriveBy': 1,
  'history': 1,
  'shipping.address.region': 1,
  'shipping.address.city': 1,
  'shipping.address.fullName': 1,
  'advancedFulfillment.localDelivery': 1,
  'advancedFulfillment.rushDelivery': 1,
  'advancedFulfillment.kayakRental.vendor': 1,
  'advancedFulfillment.kayakRental.qty': 1,
  'advancedFulfillment.rushShippingPaid': 1,
  'infoMissing': 1,
  'itemMissingDetails': 1,
  'bundleMissingColor': 1,
  'advancedFulfillment.impossibleShipDate': 1
};

AdvancedFulfillment.fields.custServOrders = {
  '_id': 1,
  'shopifyOrderNumber': 1,
  'startTime': 1,
  'endTime': 1,
  'rentalDays': 1,
  'advancedFulfillment.returnDate': 1,
  'advancedFulfillment.shipmentDate': 1,
  'advancedFulfillment.workflow.status': 1,
  'advancedFulfillment.items._id': 1,
  'advancedFulfillment.items.workflow': 1,
  'advancedFulfillment.arriveBy': 1,
  'history': 1,
  'shipping.address.region': 1,
  'shipping.address.city': 1,
  'shipping.address.fullName': 1
};
