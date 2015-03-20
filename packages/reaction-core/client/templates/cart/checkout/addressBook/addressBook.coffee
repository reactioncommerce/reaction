###
# Template.checkoutAddressBook
# template determines which view should be used:
# addAddress (edit or add)
# addressBookView (view)
###
Template.checkoutAddressBook.helpers
  account: ->
    account = ReactionCore.Collections.Accounts.findOne()
    addressBookView = Session.get "addressBookView"
    # configure addressBookView
    # TODO: use reactiveVar?
    unless account?.profile?.addressBook
      Session.setDefault "addressBookView", "addressBookAdd"
    else
      Session.setDefault "addressBookView", "addressBookGrid"
    # regardless of view, set account context
    return account

  addressBookView: ->
    return Session.get "addressBookView"

@addressBookEditId = new ReactiveVar()
Template.checkoutAddressBook.events
  'click .address-edit-icon': (event,template) ->
    addressBookEditId.set(@._id)
    Session.set "addressBookView", "addressBookEdit"

  'click #newAddress': () ->
    if Session.equals "addressBookView", "addressBookAdd"
      Session.set "addressBookView", "addressBookGrid"
    else
      Session.set "addressBookView", "addressBookAdd"
