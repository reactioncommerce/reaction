Template.shopSettings.helpers
  packageData: ->
    return ReactionCore.Collections.Packages.findOne({name:"core"})

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

###
# autoform alerts
###
AutoForm.hooks shopEditForm:
  onSuccess: (operation, result, template) ->
    Alerts.add "Shop general settings saved.", "success", autoHide: true

  onError: (operation, error, template) ->
    Alerts.add "Shop general settings update failed. " + error, "danger"

AutoForm.hooks shopEditAddressForm:
  onSuccess: (operation, result, template) ->
    Alerts.add "Shop address settings saved.", "success", autoHide: true

  onError: (operation, error, template) ->
    Alerts.add "Shop address settings update failed. " + error, "danger"

AutoForm.hooks shopEditEmailForm:
  onSuccess: (operation, result, template) ->
    Alerts.add "Shop mail settings saved.", "success", autoHide: true

  onError: (operation, error, template) ->
    Alerts.add "Shop mail settings update failed. " + error, "danger"

AutoForm.hooks shopEditSettingsForm:
  onSuccess: (operation, result, template) ->
    Alerts.add "Shop settings saved.", "success", autoHide: true

  onError: (operation, error, template) ->
    Alerts.add "Shop setting update failed. " + error, "danger"

AutoForm.hooks shopEditOptionsForm:
  onSuccess: (operation, result, template) ->
    Alerts.add "Shop options saved.", "success", autoHide: true

  onError: (operation, error, template) ->
    Alerts.add "Shop options update failed. " + error, "danger"
