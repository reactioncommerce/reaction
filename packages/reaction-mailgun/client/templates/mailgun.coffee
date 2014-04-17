Template.mailgun.helpers
  packageData: ->
    return Packages.findOne({name:"reaction-mailgun"})

AutoForm.hooks "mailgun-update-form":
  onSuccess: (operation, result, template) ->
    Alerts.add "Mailgun settings saved.", "success"

  onError: (operation, error, template) ->
    Alerts.add "Mailgun settings update failed. " + error, "danger"
