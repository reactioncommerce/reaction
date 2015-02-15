Template.addressBookAdd.helpers
  addressBookExists: ->
    return Meteor.user().profile.addressBook

  thisAddress: ->
    thisAddress = {'fullName': Meteor.user().profile?.name}
    if Session.get("address")
      thisAddress.postal = Session.get("address").zipcode
      thisAddress.country = Session.get("address").countryCode
      thisAddress.city = Session.get("address").city
      thisAddress.region = Session.get("address").state
    thisAddress

Template.addressBookAdd.events
  'click #cancel-new, form submit': () ->
    Session.set "addressBookView", "view"

  'submit form': () ->
    Session.set "addressBookView", "view"
