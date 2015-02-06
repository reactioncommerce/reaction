Template.addressBookEdit.helpers
  thisAddress: ->
    addressId = Session.get "addressBookView"
    for address in Meteor.user().profile.addressBook
      if address._id is addressId
        thisAddress = address
    console.log thisAddress    
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
    
    form.isBillingDefault = if form.isBillingDefault then true else false
    form.isShippingDefault = if form.isShippingDefault then true else false
    form.isCommercial = if form.isCommercial then true else false
    Meteor.call("addressBookUpdate",form)
    Session.set "addressBookView", "view"
