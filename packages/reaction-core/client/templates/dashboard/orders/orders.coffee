Template.orders.helpers
  orders: () ->
    orders = Orders.find().fetch()
    if orders.length > 0
      return orders
    else
      return false

  fulfillmentWorkflow: ->
    # to define fulfillment workflow, alter OrderWorkflowEvents
    fulfillmentWorkflow = []
    fulfillmentWorkflowKeys = Object.keys(OrderWorkflow)
    for key of OrderWorkflow
      for events,index in OrderWorkflowEvents
        if events.name is key
          count = Orders.find({state: key }).count()
          value = key
          if (count > 0 or displayNext isnt false)
            if count is 0
              displayNext = false
              finalEvent = index: index, count:count,value:value,label: events.label
            if count > 0
              displayNext = true
              fulfillmentWorkflow.push {index: index, count:count,value:value,label: events.label}

    fulfillmentWorkflow.push finalEvent
    fulfillmentWorkflow