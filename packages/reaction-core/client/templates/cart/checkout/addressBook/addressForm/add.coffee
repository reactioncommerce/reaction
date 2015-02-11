Template.addressBookAdd.helpers
  addressBook: ->
    Meteor.user().profile?.addressBook

  thisAddress: ->
    thisAddress = {'fullName': Meteor.user().profile?.name}
    if Session.get("address")
      thisAddress.postal = Session.get("address").zipcode
      thisAddress.country = Session.get("address").countryCode
      thisAddress.city = Session.get("address").city
      thisAddress.region = Session.get("address").state
    thisAddress

Template.addressBookForm.helpers
  countryOptions: ->
    options = []
    shop = ReactionCore.Collections.Shops.findOne()
    for country, locale of shop?.locales.countries
      options.push {'label': locale.name, 'value': country}
    return options

Template.addressBookAdd.events
  'click #cancel-new, form submit': () ->
    Session.set "addressBookView", "view"

  'submit form': () ->
    Session.set "addressBookView", "view"
