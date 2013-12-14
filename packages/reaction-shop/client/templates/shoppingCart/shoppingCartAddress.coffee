addressForm = new AutoForm(CustomerAddressSchema)
addressListDep = new Deps.Dependency();

Template.addAddress.helpers
  addAddressForm: ->
    addressForm
  addressList: ->
    profile = Meteor.user().profile
    if profile
      if profile.addressList
        profile.addressList
  countryOptions: ->
    SystemConfig.findOne().countries
  defaultCountry: ->
    UserLocation.findOne().country
  defaultCity: ->
    UserLocation.findOne().city
  defaultPostal: ->
    UserLocation.findOne().postal
  defaultRegion: ->
    UserLocation.findOne().region

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
  selectBillAddress: (id) ->
    if (id is Session.get("billingUserAddressId"))
      return "active fa fa-check-circle fa-lg"
  selectShipAddress: (id) ->
    if (id is Session.get("shippingUserAddressId"))
      return "active fa fa-check-circle fa-lg"

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
      $("ul li[data-ship-id='"+Session.get("shippingUserAddressId")+"']").removeClass("active fa fa-check-circle fa-lg")
    Session.set("shippingUserAddressId", this._id)
    $(event.currentTarget).addClass("active fa fa-check-circle fa-lg")

  'click .address-bill-to': (event,template) ->
    if Session.get("billingUserAddressId")?
      $("ul li[data-bill-id='"+Session.get("billingUserAddressId")+"']").removeClass("active fa fa-check-circle fa-lg")
    Session.set("billingUserAddressId", this._id)
    $(event.currentTarget).addClass("active fa fa-check-circle fa-lg")

Template.userAddress.rendered = ->
  profile = Meteor.user().profile
  if profile
    if profile.addressList
      addressListDep #update addresses when user login
      unless Session.get("shippingUserAddressId")?
        _.each profile.addressList, ((address) ->
          if address.isDefault? and address.isDefault is true
            $("ul li[data-ship-id='"+address._id+"']").addClass("active fa fa-check-circle fa-lg")
            Session.set("shippingUserAddressId", address._id)
        )
      unless Session.get("billingUserAddressId")?
        _.each profile.addressList, ((address) ->
          if address.isDefault? and address.isDefault is true
            $("ul li[data-bill-id='"+address._id+"']").addClass("active fa fa-check-circle fa-lg")
            Session.set("billingUserAddressId", address._id)
        )