Template.paypal.helpers
  packageData: ->
    return Packages.findOne({name:"reaction-paypal"})
  paypalSettingsForm: ->
    paypalSettingsForm = new AutoForm PaypalPackageSchema
    paypalSettingsForm.hooks
      onSubmit: (insertDoc,updateDoc,currentDoc) ->
        if updatePackage(updateDoc)
          Alerts.add "Paypal settings saved.", "success"
    paypalSettingsForm

updatePackage = (updateDoc) ->
  packageId = Packages.findOne({name:"reaction-paypal"})._id
  Packages.update packageId, updateDoc,(error,result) ->
    return false if error
  return true
