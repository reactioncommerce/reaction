Template.checkoutAddressBook.helpers
  addressBook: ->
    Meteor.user().profile?.addressBook

  selectedBilling: ->
    if @._id is Session.get "billingUserAddressId"
      return "active"
    unless Session.get("billingUserAddressId")?
      if @.isDefault
        CartWorkflow.paymentAddress(@)
        return "active"

  selectedShipping: ->
    if @._id is Session.get "shippingUserAddressId"
      return "active"
    unless Session.get("shippingUserAddressId")?
      if @.isDefault
        CartWorkflow.shipmentAddress(@)
        Session.set "shippingUserAddressId",@._id
        return "active"

# Template.checkoutAddressBook.rendered = ->
#     if @._id is Session.get "billingUserAddressId"
#       console.log @._id
#       $('#billing-'+@.id).addClass("active")

Template.checkoutAddressBook.events
  'click #newAddress': () ->
    toggleAddressForm()
    template = Meteor.render Template.addressBookAdd
    $('#addressForm').html(template)

  'click .address-ship-to': (event,template) ->
    CartWorkflow.shipmentAddress(@)
    Session.set("shippingUserAddressId", @._id)

  'click .address-bill-to': (event,template) ->
    CartWorkflow.paymentAddress(@)
    Session.set("billingUserAddressId", @._id)

  'click .address-edit-icon': (event,template) ->
    toggleAddressForm()
    template = Meteor.render Template.addressBookEdit @
    $('#addressForm').html(template)


  'click #cancel-new': () ->
    toggleAddressForm()

  'submit #addressBookEditForm': (event,template) ->
    # TODO: This should be handled by autoform, but something
    # is not triggering js on the rendered template
    # this approach works for now, but not optimal
    event.preventDefault()
    event.stopPropagation()
    form = {}
    $.each $("#addressBookEditForm").serializeArray(), ->
      form[@name] = @value
    form.isDefault = true if form.isDefault = "true"
    form.isCommercial = true if form.isCommercial = "true"
    Meteor.call("addressBookUpdate",form)
    toggleAddressForm()

toggleAddressForm = () ->
  $('#newAddress').toggle()
  $('#addressBook').toggle()
  $('.addressForm').toggle()