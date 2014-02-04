Template.memberForm.events
  "submit form": (event, template) ->
    event.preventDefault()
    $form = $(template.find("form"))
    hash = $form.serializeHash()
    Meteor.call "inviteShopMember", Meteor.app.shopId, hash.email, hash.name, (error) ->
      unless error
        $(template.find(".modal")).modal("hide"); # manual hide fix for Meteor reactivity
