Template.paypal.helpers
  paypalForm: ->
    packageConfig = Packages.findOne({name:"reaction-paypal"})
    if packageConfig?._id
      return Template.paypalUpdateForm
    else
      return paypalInsertForm
      # return Template.paypalInsertForm

Template.paypalUpdateForm.helpers
  packageData: ->
    return Packages.findOne({name:"reaction-paypal"})

  paypalConfigSchema: ->
    return PaypalPackageSchema

AutoForm.hooks "paypal-update-form":
  onSubmit: (insertDoc,updateDoc,currentDoc) ->
    Meteor.call "updatePackage", updateDoc, "reaction-paypal", (error,results) ->
      # if error then console.log error
      if results then Alerts.add "Paypal settings saved.", "success"