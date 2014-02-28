Template.stateHelperTracking.events
  "click #add-tracking-code": (event,template) ->
    event.preventDefault()
    tracking =  $(event.target).find("[name=input-tracking-code]").val()
    #transition order to next workflow
    currentState = Orders.findOne(@._id).state
    OrderWorkflow.current = currentState
    OrderWorkflow[currentState](@,tracking)
    #save tracking
    OrderWorkflow.shipmentTracking @, tracking