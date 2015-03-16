Template.addressBookEdit.helpers
  thisAddress: ->
    account = ReactionCore.Collections.Accounts.findOne()
    addressId = Session.get "addressBookView"

    for address in account?.profile?.addressBook
      if address._id is addressId then return address

Template.addressBookEdit.events
  'click #cancel-address-edit': () ->
    Session.set "addressBookView", "view"

  'submit form': () ->
    Session.set "addressBookView", "view"

AutoForm.hooks addressBookEditForm:
  before:
    'addressBookUpdate': (doc, template) ->
      Meteor.call "addressBookUpdate", doc,{}, Session.get "sessionId"
      return doc
