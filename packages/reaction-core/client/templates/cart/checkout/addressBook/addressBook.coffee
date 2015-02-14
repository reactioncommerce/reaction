###
# Template.checkoutAddressBook
# template determines which view should be used:
# addAddress (edit or add)
# addressBookView (view)
###
Template.checkoutAddressBook.helpers
  addressMode: ->
    # TODO this will need updating with new customers collection
    # users without addressbook always must add
    # this could be made optional for digital purchases
    unless Meteor.user().profile.addressBook
      Session.set "addressBookView", "addAddress"
      return "addAddress"
    else
      return Session.get "addressBookView"

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
