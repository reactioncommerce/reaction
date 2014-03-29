Template.addressBookEdit.helpers
  thisAddress: ->
    addressId = Session.get "addressBookView"
    for address in Meteor.user().profile.addressBook
      if address._id is addressId
        thisAddress = address
    thisAddress


Template.addressBookEdit.events
  'click #cancel-address-edit': () ->
    Session.set "addressBookView", "view"

  # TODO: This should be handled by autoform, but something
  # is not triggering js on the rendered template
  # this approach works for now, but not optimal
  'submit #addressBookEditForm': (event,template) ->

    form = {}
    $.each $("#addressBookEditForm").serializeArray(), ->
      form[@name] = @value
    form.isDefault = true if form.isDefault = "true"
    form.isCommercial = true if form.isCommercial = "true"
    Meteor.call("addressBookUpdate",form)
    Session.set "addressBookView", "view"