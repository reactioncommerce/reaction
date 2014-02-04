addressBookDep = new Deps.Dependency()

Template.addressBookEdit.helpers
  thisAddress: ->
    @
  addressBookEditForm: ->
    addressBookEditForm = new AutoForm AddressSchema
    addressBookEditForm.hooks
      onSubmit: (insertDoc,updateDoc,currentDoc) ->
        console.log "This should be working, but is not!!!"
        if updatePackage(updateDoc)
          throwAlert "Paypal","Settings saved ", "success"
    addressBookEditForm