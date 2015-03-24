Template.shopAccounts.helpers
  members: () ->
    return Shops.findOne()?.members

Template.shopAccounts.events
  "click .button-add-member": (event,template) ->
    $('.settings-account-list').hide()
    $('.member-form').removeClass('hidden')
