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
  defaultWorkflow = shopWorkflows.defaultWorkflows[0].workflow #just defaults
  currentStatus = ReactionCore.Collections.Cart.findOne().status
  cartWorkflow = []

  # TODO: This is a quick and dirty solution to split the
  # checkout steps into 2 colums.
  cartWorkflowMain = []
  cartWorkflowAside = []
  # validate currentStatus in shopWorkflows
  found = defaultWorkflow.indexOf(currentStatus)
  unless found then currentStatus = defaultWorkflow?[0]

  # currentStatus = found || currentStatus = cartWorkflow[0]
  # this logic is just to set status = true to steps already prior to current
  # if no current state, the first state is the default
  # and all previously completed states are also true
  for workflow, index in defaultWorkflow

    if !stopAt and workflow isnt currentStatus then status = true

    if workflow is currentStatus and !stopAt
      if index is 0 then stopAt = 1 else stopAt = index + 1

      status = true
    # we're done here
    if index >= stopAt then status = false
    cartWorkflow.push index: index, position: index + 1, workflow: workflow, status: status

    # TODO: Make this better. Perhaps store position data with workflow
    # views in the database
    if cartWorkflow[index].workflow in ['checkoutReview', 'checkoutPayment']
      cartWorkflowAside.push cartWorkflow[index]
    else
      cartWorkflowMain.push cartWorkflow[index]
  console.table cartWorkflow
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

  if workflowStep.status is true and currentStatus isnt workflowStep.workflow
    return true
  else
    return false
