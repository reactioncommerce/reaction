addressForm = new AutoForm(AddressSchema)
addressBookDep = new Deps.Dependency()

Template.addAddress.helpers
  addAddressForm: ->
    addressForm
  addressBook: ->
    Meteor.user().profile?.addressBook
  countryOptions: ->
    SystemConfig.findOne().countries
  defaultCountry: ->
    Session.get("address").countryCode
  defaultCity: ->
    Session.get("address").city
  defaultPostal: ->
    Session.get("address").zipcode
  defaultRegion: ->
    Session.get("address").state

Template.addAddress.events
  'click #cancel-new': () ->
    $('#newAddress').show()
    $('#addressBook').show()
    $('.addressForm').hide()


Template.userAddress.helpers
  addressBook: ->
    Meteor.user().profile?.addressBook
  selectBillAddress: (id) ->
    if (id is Session.get("billingUserAddressId"))
      return "active fa fa-check-circle fa-lg"
  selectShipAddress: (id) ->
    if (id is Session.get("shippingUserAddressId"))
      return "active fa fa-check-circle fa-lg"

Template.userAddress.events
  'click #newAddress': () ->
    $('#newAddress').hide()
    $('#addressBook').hide()
    if $('.addressForm').text()
      $('.addressForm').show()
    else
      $('.addressForm').html(Meteor.render(->
        Template['addAddress']() # this calls the template and returns the HTML.
      ));
  'click .address-ship-to': (event,template) ->
    if Session.get("shippingUserAddressId")?
      $("ul li[data-ship-id='"+Session.get("shippingUserAddressId")+"']").removeClass("active fa fa-check-circle fa-lg")
    Session.set("shippingUserAddressId", this._id)
    $(event.currentTarget).addClass("active fa fa-check-circle fa-lg")

  'click .address-bill-to': (event,template) ->
    if Session.get("billingUserAddressId")?
      $("ul li[data-bill-id='"+Session.get("billingUserAddressId")+"']").removeClass("active fa fa-check-circle fa-lg")
    Session.set("billingUserAddressId", this._id)
    $(event.currentTarget).addClass("active fa fa-check-circle fa-lg")

  'click .fa-pencil': (event,template) ->
    console.log "edit here"

Template.userAddress.rendered = ->
  if Meteor.user().profile?.addressBook
    addressBookDep #update addresses when user login
    unless Session.get("shippingUserAddressId")?
      _.each Meteor.user().profile.addressBook, ((address) ->
        if address.isDefault? and address.isDefault is true
          $("ul li[data-ship-id='"+address._id+"']").addClass("active fa fa-check-circle fa-lg")
          Session.set("shippingUserAddressId", address._id)
      )
    unless Session.get("billingUserAddressId")?
      _.each Meteor.user().profile.addressBook, ((address) ->
        if address.isDefault? and address.isDefault is true
          $("ul li[data-bill-id='"+address._id+"']").addClass("active fa fa-check-circle fa-lg")
          Session.set("billingUserAddressId", address._id)
      )
