Template.socialDashboard.helpers
  packageData: ->
    return ReactionCore.Collections.Packages.findOne({name: 'reaction-social'})

AutoForm.hooks "social-update-form":
  onSuccess: (operation, result, template) ->
    Alerts.removeSeen()
    Alerts.add "Social settings saved.", "success", autoHide: true

  onError: (operation, error, template) ->
    Alerts.removeSeen()
    Alerts.add "Social settings update failed. " + error, "danger"
