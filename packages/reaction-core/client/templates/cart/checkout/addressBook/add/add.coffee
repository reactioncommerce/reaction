Template.addressBookAdd.helpers
  thisAddress: ->
    account = ReactionCore.Collections.Accounts.findOne()
    thisAddress = {'fullName': account?.profile?.name}
    if Session.get("address")
      thisAddress.postal = Session.get("address").zipcode
      thisAddress.country = Session.get("address").countryCode
      thisAddress.city = Session.get("address").city
      thisAddress.region = Session.get("address").state
    thisAddress

Template.addressBookAdd.events
  'click #cancel-new, form submit': () ->
    Session.set "addressBookView", "addressBookGrid"

  'submit form': () ->
    Session.set "addressBookView", "addressBookGrid"

###
# addressBookAddForm form handling
# gets accountId and calls addressBookAdd method
###
AutoForm.hooks addressBookAddForm: onSubmit: (insertDoc, updateDoc, currentDoc) ->
  this.event.preventDefault()
  accountId = ReactionCore.Collections.Accounts.findOne()._id
  # this should be handled by schema
  unless insertDoc._id then insertDoc._id = Random.id()
  # try addressBookAdd method
  try
    Meteor.call "addressBookAdd", insertDoc, accountId
  catch error
    @done new Error('Failed to add address', error)
    return false

  # done and reset sessions
  @done()
  Session.set "addressBookView", "addressBookGrid"
  addressBookEditId.set()
  return
