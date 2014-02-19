Template.orders.helpers
  orders: () ->
    Orders.find()

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
            if count is 0 then displayNext = false
            fulfillmentWorkflow.push {index: index, count:count,value:value,label: events.label}
    fulfillmentWorkflow