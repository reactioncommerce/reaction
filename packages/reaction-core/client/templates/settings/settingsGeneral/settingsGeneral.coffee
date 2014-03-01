Template.settingsGeneral.helpers
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

  shopEditForm: ->
    shopEditForm = new AutoForm Shops
    shopEditForm.hooks
      formToDoc: (doc) ->
        doc.domains = doc.domains.split(",")  if typeof doc.domains is "string"
        doc
      onSuccess: (operation, result, template) ->
        $.pnotify
          title: "Shop settings"
          text: "Shop settings are saved."
          type: "success"
    shopEditForm

  displayCustomEmailSettings: (doc) ->
    if doc.useCustomEmailSettings
      style = "display:none"
      style

Template.settingsGeneral.events
  "change #useCustomEmailSettings": (event) ->
    $('.useCustomEmailSettings').slideToggle()
