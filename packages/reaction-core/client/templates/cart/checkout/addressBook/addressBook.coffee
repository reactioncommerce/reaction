Template.checkoutAddressBook.helpers
  addressMode: ->
      Session.get "addressBookView"

  addressBookView: (mode)->
    mode = this.mode
    if mode?
      switch mode
        when "view" then return Template.addressBookGrid
        when "addAddress" then return Template.addressBookAdd
        else return Template.addressBookEdit
    else
      if Meteor.user().profile?.addressBook
        Session.setDefault "addressBookView", "view"
        return Template.addressBookGrid
      else
        Session.setDefault "addressBookView", "addAddress"
        return Template.addressBookAdd


Template.checkoutAddressBook.events
  'click .address-edit-icon': (event,template) ->
    Session.set "addressBookView", this._id

  'click #newAddress': () ->
    if Session.equals "addressBookView", "addAddress"
      Session.set "addressBookView", "view"
    else
      Session.set "addressBookView", "addAddress"

Template.addressBookGrid.helpers
  addressBook: ->
    Meteor.user().profile?.addressBook

  selectedBilling: ->
    if @.isDefault
      Session.setDefault "billingUserAddressId", @._id
      CartWorkflow.paymentAddress(@)
    if Session.equals "billingUserAddressId", @._id
      return "active"

  selectedShipping: ->
    if @.isDefault
      Session.setDefault "shippingUserAddressId",@._id
      CartWorkflow.shipmentAddress(@)
    if Session.equals "shippingUserAddressId", @._id
      return "active"

Template.addressBookGrid.events
  'click .address-ship-to': (event,template) ->
    CartWorkflow.shipmentAddress(@)
    Session.set("shippingUserAddressId", @._id)

  'click .address-bill-to': (event,template) ->
    CartWorkflow.paymentAddress(@)
    Session.set("billingUserAddressId", @._id)


