Template.addressBookAdd.helpers
  addressBook: ->
    console.log Meteor.user().profile?.addressBook
    Meteor.user().profile?.addressBook

Template.addressBookForm.helpers
  countryOptions: ->
    ConfigData.findOne().countries
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
  isDefault: ->

Template.addressBookAdd.events
  'click #cancel-new, form submit': () ->
    Session.set "addressBookView", "view"

  'submit form': () ->
    Session.set "addressBookView", "view"
