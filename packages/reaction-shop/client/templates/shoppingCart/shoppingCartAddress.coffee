addressForm = new AutoForm(CustomerAddressSchema)

Template.addAddress.helpers addAddressForm: ->
  addressForm

Template.userAddress.helpers
  addressList: ->
    profile = Meteor.user().profile
    if profile
      if profile.addressList
        profile.addressList
