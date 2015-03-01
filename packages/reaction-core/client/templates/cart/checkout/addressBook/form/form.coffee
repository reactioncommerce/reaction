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

  ###
  # TODO: consider adding default on edit,where no default exists
  ###
  isBillingDefault: ->
    account = ReactionCore.Collections.Accounts.findOne()
    unless @_af.doc.isBillingDefault is true
      unless account?.profile?.addressBook then return true
    else
      return @_af.doc.isBillingDefault

  isShippingDefault: ->
    account = ReactionCore.Collections.Accounts.findOne()
    unless @_af.doc.isShippingDefault is true
      unless account?.profile?.addressBook then return true
    else
      return @_af.doc.isShippingDefault
