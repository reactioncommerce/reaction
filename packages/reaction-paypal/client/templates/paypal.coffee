Template.paypal.helpers
  packageData: ->
    return Packages.findOne({name:"reaction-paypal"})

AutoForm.hooks "paypal-update-form":
  onSuccess: (operation, result, template) ->
    Alerts.add "Paypal settings saved.", "success"

  onError: (operation, error, template) ->
    Alerts.add "Paypal settings update failed. " + error, "danger"
