Template.addressBookForm.helpers
  countryOptions: ->
    options = []
    shop = ReactionCore.Collections.Shops.findOne()
    for country, locale of shop?.locales.countries
      options.push {'label': locale.name, 'value': country}
    return options

  ###
  # TODO: update when we add customers collection
  # TODO: consider adding default on edit,where no default exists
  ###
  isBillingDefault: ->
    unless @_af.doc.isBillingDefault is true
      unless Meteor.user().profile.addressBook then return true
    else
      return @_af.doc.isBillingDefault

  isShippingDefault: ->
    unless @_af.doc.isShippingDefault is true
      unless Meteor.user().profile.addressBook then return true
    else
      return @_af.doc.isShippingDefault
