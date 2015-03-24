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
