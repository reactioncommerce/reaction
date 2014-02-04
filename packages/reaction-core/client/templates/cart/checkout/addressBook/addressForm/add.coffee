addressAddForm = new AutoForm(AddressSchema)
# addressBookDep = new Deps.Dependency()

Template.addressBookAdd.helpers
  addressBookAddForm: ->
    # addressAddForm.hooks before:
    #   addressBookAdd: (doc) ->
    #     #potential server method to reset existing default
    addressAddForm
  addressBook: ->
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
