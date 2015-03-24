###
# Template.addressBookEdit.helpers
###
Template.addressBookEdit.helpers
  # set in addressBook.coffee
  thisAddress: ->
    addressId = addressBookEditId.get()
    account = @
    for address in account?.profile?.addressBook
      if address._id is addressId
        return address

###
# clear addressBook edit sessions if cancel
###
Template.addressBookEdit.events
  'click #cancel-address-edit': () ->
    Session.set "addressBookView", "addressBookGrid"
    addressBookEditId.set()

###
# update address book (cart) form handling
# onSubmit we need to add accountId which is not in context
###
AutoForm.hooks addressBookEditForm: onSubmit: (insertDoc, updateDoc, currentDoc) ->
  this.event.preventDefault()
  accountId = ReactionCore.Collections.Accounts.findOne()._id
  # if we successfully update address, we also want to update the cart workflow
  try
    Meteor.call "addressBookUpdate", insertDoc, accountId, (error, result) ->
      if result
        cart = ReactionCore.Collections.Cart.findOne()
        # reset cart to updated address
        if cart?.shipping?.address?._id = insertDoc._id
          CartWorkflow.shipmentAddress(insertDoc)

        if cart?.payment?.address?._id = insertDoc._id
          CartWorkflow.paymentAddress(insertDoc)
        # finished editing, and updating cart
  catch error
    @done new Error(error)
    return false

  # done and reset sessions
  @done()
  Session.set "addressBookView", "addressBookGrid"
  addressBookEditId.set()
