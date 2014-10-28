Template.settingsGeneral.helpers
  addressBook: ->
      address = Shops.findOne().addressBook
      return address[0]

  countryOptions: ->
    countries = ReactionCore.Collections.Shops.findOne().locales.countries
    countryOptions = []
    for locale, country of countries
      countryOptions.push {label: country.name, value: locale}
    #sort alphabetically by label
    countryOptions.sort (a, b) ->
      return -1  if a.label < b.label
      return 1  if a.label > b.label
      0
    return countryOptions

  currencyOptions: ->
    currencies = ReactionCore.Collections.Shops.findOne().currencies
    currencyOptions = []
    for currency, structure of currencies
      currencyOptions.push {label: currency + "  |  " + structure.symbol + "  |  " + structure.format, value: currency}
    return currencyOptions

  timezoneOptions: ->
    zoneData = ReactionCore.Collections.Shops.findOne().timezones
    timezoneOptions = []
    for zone in zoneData
      timezoneOptions.push {label: zone, value: zone}
    return timezoneOptions

  uomOptions: ->
    unitsOfMeasure = ReactionCore.Collections.Shops.findOne().unitsOfMeasure
    uomOptions = []
    for measure, uom of unitsOfMeasure
      uomOptions.push {label: uom.name, value: measure}
    return uomOptions

  portOptions: [
    {label: 25, value: 25}
    {label: 587, value: 587}
    {label: 465, value: 465}
    {label: 475, value: 475}
    {label: 2525, value: 2525}
  ]

  displayCustomEmailSettings: (doc) ->
    if doc.useCustomEmailSettings
      style = "display:none"
      style

Template.settingsGeneral.events
  "change #useCustomEmailSettings": (event) ->
    $('.useCustomEmailSettings').slideToggle()


AutoForm.hooks shopEditForm:
  onSuccess: (operation, result, template) ->
    Alerts.add "Shop general settings saved.", "success"

  onError: (operation, error, template) ->
    Alerts.add "Shop general settings update failed. " + error, "danger"

AutoForm.hooks shopEditAddressForm:
  onSuccess: (operation, result, template) ->
    Alerts.add "Shop address settings saved.", "success"

  onError: (operation, error, template) ->
    Alerts.add "Shop address settings update failed. " + error, "danger"

AutoForm.hooks shopEditEmailForm:
  onSuccess: (operation, result, template) ->
    Alerts.add "Shop SMTP settings saved.", "success"

  onError: (operation, error, template) ->
    Alerts.add "Shop SMTP settings update failed. " + error, "danger"

AutoForm.hooks shopEditSettingsForm:
  onSuccess: (operation, result, template) ->
    Alerts.add "Shop settings saved.", "success"

  onError: (operation, error, template) ->
    Alerts.add "Shop setting update failed. " + error, "danger"




# AutoForm.hooks shopEditSettingsForm:
#   formToDoc: (doc) ->
#     for domain in doc.domains
#       if domain is "localhost" then localhost = true
#     if localhost then doc.domains.push "localhost"
#     return false
#     doc
