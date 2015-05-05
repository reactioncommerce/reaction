Template.memberForm.events
  "submit form": (event, template) ->
    event.preventDefault()
    $form = $(template.find("form"))
    hash = $form.serializeHash()
    Meteor.call "inviteShopMember", ReactionCore.getShopId(), hash.email, hash.name, (error) ->
      if error?
        console.log(error)
        if error.reason != ''
          Alerts.add error, "danger", html: true
        else
          Alerts.add "Error sending email, possible configuration issue." + error, "danger"
        return false
      else
        Alerts.add i18n.t("app.invitationSent", "Invitation sent."), "success", autoHide: true
        $('.member-form').addClass('hidden')
        $('.settings-account-list').show()
        return true

  "click .close-button": (event, template) ->
    $('.member-form').addClass('hidden')
    $('.settings-account-list').show()
