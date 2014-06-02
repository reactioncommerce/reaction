Template.settingsAccount.helpers
  members: () ->
    Shops.findOne().members

Template.settingsAccount.events
  "click .button-add-member": (event,template) ->
    $('.settings-account-list').hide()
    $('.member-form').removeClass('hidden')
