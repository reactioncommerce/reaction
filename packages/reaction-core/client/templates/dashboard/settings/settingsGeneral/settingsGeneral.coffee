Template.settingsGeneral.helpers
  addressBook: ->
      address = Shops.findOne().addressBook
      return address[0]

  countryOptions: ->
    ConfigData.findOne().countries

  timezoneOptions: ->
    zoneData = ConfigData.findOne().timezones
    zonelist = []
    for zone in zoneData
      zonelist.push {label:zone,value:zone}
    zonelist

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
