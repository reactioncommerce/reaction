/**
* orders helpers
*
*/
Template.orders.helpers({
  orders: function() {
    return Orders.find();
  },
  isOrder: function() {
    if (this._id) {
      return true;
    } else {
      return false;
    }
  },
  fulfillmentWorkflow: function() {
    var count, displayNext, events, finalEvent, fulfillmentWorkflow, index, key, value, _i, _len;
    fulfillmentWorkflow = [];
    for (key in OrderWorkflow) {
      for (index = _i = 0, _len = OrderWorkflowEvents.length; _i < _len; index = ++_i) {
        events = OrderWorkflowEvents[index];
        if (events.name === key) {
          count = Orders.find({
            status: key
          }).count();
          value = key;
          if (count > 0 || displayNext !== false) {
            if (count === 0) {
              displayNext = false;
              finalEvent = {
                index: index,
                count: count,
                value: value,
                label: events.label
              };
            } else {
              displayNext = true;
              fulfillmentWorkflow.push({
                index: index,
                count: count,
                value: value,
                label: events.label
              });
            }
          }
        }
      }
    }
    fulfillmentWorkflow.push(finalEvent);
    return fulfillmentWorkflow;
  }
});
