Template.settingsGeneral.helpers
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
      onSuccess: (operation, result, template) ->
        $.pnotify
          title: "Shop settings"
          text: "Shop settings are saved."
          type: "success"
    shopEditForm

Template.settingsGeneral.events
  "change #useCustomEmailSettings": (event) ->
    $('.useCustomEmailSettings').slideToggle()
