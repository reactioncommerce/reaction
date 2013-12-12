addressForm = new AutoForm(CustomerAddressSchema)

Template.addAddress.helpers
  addAddressForm: ->
    addressForm
  addressList: ->
    profile = Meteor.user().profile
    if profile
      if profile.addressList
        profile.addressList

Template.addAddress.events
  'click #cancel-new': () ->
    $('#newAddress').show()
    $('#addressList').show()
    $('.addressForm').hide()


Template.userAddress.helpers
  addressList: ->
    profile = Meteor.user().profile
    if profile
      if profile.addressList
        profile.addressList

Template.userAddress.events
  'click #newAddress': () ->
    $('#newAddress').hide()
    $('#addressList').hide()
    if $('.addressForm').text()
      $('.addressForm').show()
    else
      $('.addressForm').html(Meteor.render(->
        Template['addAddress']() # this calls the template and returns the HTML.
      ));
  'click .address-ship-to': (event,template) ->
    if Session.get("shippingUserAddressId")?
      $("ul li[data-id='"+Session.get("shippingUserAddressId")+"']").removeClass("active fa fa-check-circle fa-lg")
    Session.set("shippingUserAddressId", this._id)
    $(event.target).addClass("active fa fa-check-circle fa-lg")

  'click .address-bill-to': (event,template) ->
    if Session.get("billingUserAddressId")?
      $("ul li[data-id='"+Session.get("billingUserAddressId")+"']").removeClass("active fa fa-check-circle fa-lg")
    Session.set("billingUserAddressId", this._id)
    $(event.target).addClass("active fa fa-check-circle fa-lg")