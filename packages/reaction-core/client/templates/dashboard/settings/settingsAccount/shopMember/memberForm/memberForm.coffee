Template.memberForm.events
  "submit form": (event, template) ->
    event.preventDefault()
    $form = $(template.find("form"))
    hash = $form.serializeHash()
    Meteor.call "inviteShopMember", ReactionCore.getShopId(), hash.email, hash.name, (error) ->
      if error?
        Alerts.add "Error sending email, possible configuration issue." +error
      else
        Alerts.add "Invitation sent."

  "click .close-button": (event, template) ->
    $('.member-form').addClass('hidden')
    $('.settings-account-list').show()