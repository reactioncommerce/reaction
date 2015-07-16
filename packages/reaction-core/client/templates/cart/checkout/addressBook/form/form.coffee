Template.addressBookForm.helpers
  ###
  # TODO: update for i18n
  ###
  countryOptions: ->
    options = []
    shop = ReactionCore.Collections.Shops.findOne()
    for country, locale of shop?.locales.countries
      options.push {'label': locale.name, 'value': country}
    return options
  statesForCountry: ->
    shop = ReactionCore.Collections.Shops.findOne()
    selectedCountry = AutoForm.getFieldValue('country')
    unless selectedCountry  
      return false
    unless shop?.locales.countries[selectedCountry].states?  
      return false
    options = []  
    for state, locale of shop?.locales.countries[selectedCountry].states
      options.push {'label': locale.name, 'value': state}
    return options

  #
  # TODO: state/regions dropdown / auto populate
  #

  ###
  #  Defaults billing/shipping when 1st new address.
  ###
  isBillingDefault: ->
    unless @.profile?.addressBook and !addressBookEditId.get()
      return true

  isShippingDefault: ->
    unless @.profile?.addressBook and !addressBookEditId.get()
      return true
