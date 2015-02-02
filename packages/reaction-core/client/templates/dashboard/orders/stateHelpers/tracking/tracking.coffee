Template.stateHelperTracking.events
  "click #add-tracking-code": (event,template) ->
    event.preventDefault()
    tracking = template.find("input[name=input-tracking-code]").value
    unless tracking
      Alerts.add "Tracking required to process order.", "danger", autoHide: true
      return false

    #transition order to next workflow
    currentState = Orders.findOne(@._id).state
    OrderWorkflow.current = currentState
    OrderWorkflow[currentState](@,tracking)
    #save tracking
    OrderWorkflow.shipmentTracking @, tracking
