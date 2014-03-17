Template.settingsAccount.helpers
  members: () ->
    @.shop.members

Template.settingsAccount.events
  "click .button-add-member": (event,template) ->
    $('.settings-account-list').hide()
    $('.member-form').removeClass('hidden')
