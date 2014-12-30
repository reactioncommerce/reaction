Template.shipping.helpers
  packageData: ->
    return ReactionCore.Collections.Packages.findOne({name:"reaction-shipping"})
  shipping: ->
    ReactionCore.Collections.Shipping.find()

Template.shipping.events
  'click': () ->
    Alerts.removeSeen()

Template.addShippingMethod.helpers
  # just get the current shipping table
  shipping: ->
    return ReactionCore.Collections.Shipping.find()

Template.shippingFlatRateTable.helpers
  # just get the current shipping table
  shipping: ->
    return ReactionCore.Collections.Shipping.find()
  # toggle selected
  selectedMethod: (item) ->
    session = Session.get "selectedShippingMethod"
    if _.isEqual @, session
      return @

  #toggle addShippingMethodForm
  addShippingMethodMode: ->
    if Session.equals "addShippingMethod", true
      return true
    else
      return false


Template.shippingFlatRateTable.events
  # toggle selected
  'click .edit-shipping-method': (event, template) ->
    session = Session.get "selectedShippingMethod"
    if _.isEqual @, session
      #toggleSession "selectedShippingMethod"
      Session.set "selectedShippingMethod", false
    else
      Session.set "selectedShippingMethod", @

  # call method to delete shipping method
  'click #delete-shipping-method': (event, template) ->
    Meteor.call "removeShippingMethod", $(event.currentTarget).data('provider-id'), @
    Alerts.add "Shipping method deleted.", "success", autoHide: true

  # add new shipping method
  'click #add-shipping-method': (event, template) ->
    toggleSession "addShippingMethod"


AutoForm.hooks "shipping-provider-insert-form":
  onSuccess: (operation, result, template) ->
    Alerts.add "Shipping provider saved.", "success", autoHide: true

AutoForm.hooks "shipping-method-edit-form":
  onSubmit: (insertDoc, updateDoc, currentDoc) ->
    try
      Meteor.call "updateShippingMethods", currentDoc._id, Template.parentData(1), insertDoc
      @done()
    catch error
      @done new Error("Submission failed")
    return false