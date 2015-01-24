###
# Template shipping Helpers
###
Template.shipping.helpers
  packageData: ->
    return ReactionCore.Collections.Packages.findOne({name:"reaction-shipping"})

  shipping: ->
    ReactionCore.Collections.Shipping.find()

  # boolean to display addShippingProvider form
  selectedShippingProvider: ->
    return Session.equals "selectedShippingProvider", true

###
# Template Shipping Events
###
Template.shipping.events
  'click': () ->
    Alerts.removeSeen()

  # add new shipping provider
  'click .add-shipping-provider': (event, template) ->
    console.log "click add-shipping-provider"
    toggleSession "selectedShippingProvider"

###
# template addShippingMethod Helpers
###
Template.addShippingMethod.helpers
  # just get the current shipping table
  shipping: ->
    return ReactionCore.Collections.Shipping.find()

###
# template addShippingProvider events
###
Template.editShippingMethod.events
  # add new shipping provider
  'click .cancel': (event, template) ->
    console.log "cancel editShippingMethod"
    toggleSession "selectedShippingMethod"
    event.preventDefault()

###
# template addShippingProvider events
###
Template.editShippingProvider.events
  # add new shipping provider
  'click .cancel': (event, template) ->
    console.log "cancel editShippingProvider"
    toggleSession "selectedShippingProvider"
    event.preventDefault()

###
# template addShippingProvider events
###
Template.addShippingProvider.events
  # add new shipping provider
  'click .cancel': (event, template) ->
    console.log "cancel addShippingProvider"
    toggleSession "selectedShippingProvider"
    event.preventDefault()

###
# template addShippingMethods events
###
Template.addShippingMethod.events
  # add new shipping provider
  'click .cancel': (event, template) ->
    console.log "cancel addShippingMethod"
    toggleSession "selectedAddShippingMethod"
    event.preventDefault()

###
# Template shippingProviderTable Helpers
###
Template.shippingProviderTable.helpers
  # just get the current shipping table
  shipping: ->
    return ReactionCore.Collections.Shipping.find()

  # toggle selected
  selectedShippingMethod: (item) ->
    session = Session.get "selectedShippingMethod"
    if _.isEqual @, session
      return @

  #toggle addShippingMethodForm
  selectedAddShippingMethod: ->
    session = Session.get "selectedAddShippingMethod"
    if _.isEqual @, session
      return @

  selectedShippingProvider: ->
    session = Session.get "selectedShippingProvider"
    if _.isEqual @, session
      return @

###
# template shippingProviderTable events
###
Template.shippingProviderTable.events
  # toggle selected method
  'click .edit-shipping-method': (event, template) ->
    session = Session.get "selectedShippingMethod"
    if _.isEqual @, session
      Session.set "selectedShippingMethod", false
    else
      Session.set "selectedShippingMethod", @

  # toggle selected provider
  'click .edit-shipping-provider': (event, template) ->
    # session = Session.get "selectedShippingProvider"
    console.log "click edit-shipping-provider"
    return toggleSession "selectedShippingProvider", @

    # if _.isEqual @, session
    #   Session.set "selectedShippingProvider", false
    # else
    #   toggleSessionObj "selectedShippingProvider", @

  # call method to delete shipping method
  'click #delete-shipping-method': (event, template) ->
    if confirm("Are you sure you want to delete "+ @.name)
      Meteor.call "removeShippingMethod", $(event.currentTarget).data('provider-id'), @
      Alerts.add "Shipping method deleted.", "success", autoHide: true, placement:"shippingPackage"
    else
      event.preventDefault()
      event.stopPropagation()
      return

  # add new shipping method
  'click #add-shipping-method': (event, template) ->
    console.log "click add-shipping-method"
    session = Session.get "selectedAddShippingMethod"
    if _.isEqual @, session
      Session.set "selectedAddShippingMethod", false
    else
      Session.set "selectedAddShippingMethod", @


###
# Autoform hooks
# Because these are some convoluted forms
###
AutoForm.hooks "shipping-method-add-form":
  onSuccess: (operation, result, template) ->
    toggleSession "selectedAddShippingMethod"
    Alerts.add "Shipping method rate added.", "success", autoHide: true, placement:"shippingPackage"

AutoForm.hooks "shipping-provider-add-form":
  onSuccess: (operation, result, template) ->
    Alerts.add "Shipping provider saved.", "success", autoHide: true, placement:"shippingPackage"

AutoForm.hooks "shipping-method-edit-form":
  onSubmit: (insertDoc, updateDoc, currentDoc) ->
    try
      Meteor.call "updateShippingMethods", Template.parentData(2)._id, Template.parentData(1), insertDoc
      Alerts.add "Shipping method rate updated.", "success", autoHide: true, placement:"shippingPackage"
      @done()
    catch error
      @done new Error("Submission failed")
    return false