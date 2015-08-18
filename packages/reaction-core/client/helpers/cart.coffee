###
# methods to return cart calculated values
# cartCount, cartSubTotal, cartShipping, cartTaxes, cartTotal
# are calculated by a transformation on the collection
# and are available to use in template as cart.xxx
# in template: {{cart.cartCount}}
# in code: ReactionCore.Collections.Cart.findOne().cartTotal()
###
Template.registerHelper "cart", () ->
  # return true if there is an issue with the user's cart and we should display the warning icon
  showCartIconWarning: ->
    if @.showLowInventoryWarning()
        return true
    return false

  # return true if any item in the user's cart has a low inventory warning
  showLowInventoryWarning: ->
    storedCart = Cart.findOne()
    if storedCart?.items
      for item in storedCart?.items
        if item.variants?.inventoryPolicy and item.variants?.lowInventoryWarningThreshold
          if (item.variants?.inventoryQuantity <= item.variants.lowInventoryWarningThreshold)
            return true
    return false

  # return true if item variant has a low inventory warning
  showItemLowInventoryWarning: (variant) ->
    if variant?.inventoryPolicy and variant?.lowInventoryWarningThreshold
      if (variant?.inventoryQuantity <= variant.lowInventoryWarningThreshold)
        return true
    return false


###
# cartPayerName
# gets current cart billing address / payment name
###
Template.registerHelper "cartPayerName",  ->
    Cart.findOne()?.payment?.address?.fullName


###
# cartWorkFlow
# describes current status of cart checkout workflow
# return object with workflow, status(boolean)
###
Template.registerHelper "cartWorkflow", (options) ->
  shopWorkflows = ReactionCore.Collections.Shops.findOne({ defaultWorkflows: { $elemMatch: { provides: "simple"} } }, fields: defaultWorkflows: true)
  currentStatus = ReactionCore.Collections.Cart.findOne().status
  cartWorkflow = []

  # TODO: This is a quick and dirty solution to split the
  # checkout steps into 2 colums.
  cartWorkflowMain = []
  cartWorkflowAside = []
  # loop through the shop's defaultWorkflows
  # and inject index and current status
  # all workflows steps until cart.status is true
  # are also marked as true
  for shopWorkflow in shopWorkflows.defaultWorkflows
    for workflow, index in shopWorkflow.workflow
      if workflow is currentStatus then status = true else status = false
      cartWorkflow.push index: index, position: index + 1, workflow: workflow, status: status

  # if no current state, the first state is the default
  # and all previously completed states are also true

  # if currentStatus in shopWorkflows
  currentWorkflow = _.findWhere(cartWorkflow, {status: true}) || currentWorkflow = cartWorkflow[0]

  if currentStatus is "new"
    stepInc = 0
  else
    stepInc = 1

  # this logic is just to set status = true to steps already past
  for workflow, index in cartWorkflow

    if workflow.position <= currentWorkflow.position + stepInc
      cartWorkflow[index].status = true
    else
      cartWorkflow[index].status = false

    # TODO: Make this better. Perhaps store position data with workflow
    # views in the database
    if cartWorkflow[index].workflow in ['checkoutReview', 'checkoutPayment']
      cartWorkflowAside.push cartWorkflow[index]
    else
      cartWorkflowMain.push cartWorkflow[index]

  return {main: cartWorkflowMain, aside: cartWorkflowAside}

###
# cartWorkflowPosition
# returns position from the workflow object
# basically index + 1  (for human step numbers)
###
Template.registerHelper "cartWorkflowPosition", (options) ->
  workflowStep = Template.parentData(2).data
  return workflowStep.position

###
# cartWorkflowCompleted
# if the cart and the workflow object have the same value the
# workflow is completed  you can use this for
# alternate template before/after or other workflow Logic
###
Template.registerHelper "cartWorkflowCompleted", (options) ->
  workflowStep = Template.parentData(2).data
  currentStatus = ReactionCore.Collections.Cart.findOne().status

  console.log 'cart workflow completed', workflowStep, currentStatus

  if workflowStep.status is true and currentStatus isnt workflowStep.workflow and currentStatus isnt "new"
    return true
  else
    return false
