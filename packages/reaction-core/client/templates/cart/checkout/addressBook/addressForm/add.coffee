Template.addressBookAdd.helpers
  addressBook: ->
    Meteor.user().profile?.addressBook

Template.addressBookForm.helpers
  countryOptions: ->
    options = []
    shop = ReactionCore.Collections.Shops.findOne()
    for country, locale of shop?.locales.countries
      options.push {'label': locale.name, 'value': country}
    return options

  regionOptions: ->
    #return list of regions for current country
  defaultCountry: ->
    Session.get("address").countryCode
  defaultCity: ->
    Session.get("address").city
  defaultPostal: ->
    Session.get("address").zipcode
  defaultRegion: ->
    Session.get("address").state
  defaultName: ->
    Meteor.user().profile?.name
  isShippingDefault: ->
  isBillingDefault: ->

Template.addressBookAdd.events
  'click #cancel-new, form submit': () ->
    Session.set "addressBookView", "view"

  'submit form': () ->
    Session.set "addressBookView", "view"
