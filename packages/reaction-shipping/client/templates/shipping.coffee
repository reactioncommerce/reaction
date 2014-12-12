Template.shipping.helpers
  packageData: ->
    return ReactionCore.Collections.Packages.findOne({name:"reaction-shipping"})

Template.shipping.events
  'click': () ->
    Alerts.removeSeen()

Template.shippingFlatRateTable.helpers
  # just get the current shipping table
  shipping: ->
    return ReactionCore.Collections.Shipping.find()
  # toggle selected
  selectedMethod: (item) ->
    session = Session.get "selectedShippingMethod"
    if _.isEqual @, session
      return @


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


AutoForm.hooks "shipping-provider-insert-form":
  onSuccess: (operation, result, template) ->
    Alerts.add "Shipping provider saved.", "success", autoHide: true

  onError: (operation, error, template) ->
    Alerts.add "Failed to add shipping provider. " + error, "danger"

AutoForm.hooks "shipping-method-form":
  onSuccess: (operation, result, template) ->
    Alerts.add "Shipping method saved.", "success", autoHide: true

  onSubmit: (insertDoc, updateDoc, currentDoc) ->
    unless @.docId then @.docId = Template.parentData(2)._id
    try
      Meteor.call "updateShippingMethods", @.docId, insertDoc, updateDoc, currentDoc
      @done()
    catch error
      @done new Error("Submission failed")
    return false

  onError: (operation, error, template) ->
    Alerts.add "Shipping method add failed. " + error, "danger", autoHide: true
