addressForm = new AutoForm(AddressSchema)
addressBookDep = new Deps.Dependency()

Template.checkoutAddressBookAdd.helpers
  checkoutAddressBookAddForm: ->
    addressForm
  addressBook: ->
    Meteor.user().profile?.addressBook
  countryOptions: ->
    ConfigData.findOne().countries
  defaultCountry: ->
    Session.get("address").countryCode
  defaultCity: ->
    Session.get("address").city
  defaultPostal: ->
    Session.get("address").zipcode
  defaultRegion: ->
    Session.get("address").state


Template.checkoutAddressBookAdd.events
  'click #cancel-new': () ->
    $('#newAddress').show()
    $('#addressBook').show()
    $('.addressForm').hide()


Template.checkoutAddressBook.helpers
  addressBook: ->
    Meteor.user().profile?.addressBook

  selectedBilling: ->
    if this._id is Session.get "billingUserAddressId"
      return "active fa fa-check-circle "
    unless Session.get("billingUserAddressId")?
      Session.set "billingUserAddressId",this._id

  selectedShipping: ->
    if this._id is Session.get "shippingUserAddressId"
      return "active fa fa-check-circle "
    unless Session.get("shippingUserAddressId")?
      if this.isDefault
        Session.set "shippingUserAddressId",this._id


Template.checkoutAddressBook.events
  'click #newAddress': () ->
    $('#newAddress').hide()
    $('#addressBook').hide()
    if $('.addressForm').text()
      $('.addressForm').show()
    else
      $('.addressForm').html(Meteor.render(->
        Template['checkoutAddressBookAdd']() # this calls the template and returns the HTML.
      ));

  'click .address-ship-to': (event,template) ->
    Session.set("shippingUserAddressId", this._id)

  'click .address-bill-to': (event,template) ->
    Session.set("billingUserAddressId", this._id)

  'click .fa-pencil': (event,template) ->
    console.log "edit here"