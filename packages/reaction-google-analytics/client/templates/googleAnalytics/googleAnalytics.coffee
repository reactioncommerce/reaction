Template.googleAnalytics.helpers
  packageConfig: () ->
    Packages.findOne({name: "reaction-google-analytics"})

AutoForm.hooks gaSettingsForm:
  onSuccess: (operation, result, template) ->
    Alerts.add "Google Analytics settings saved.", "success"

  onError: (operation, error, template) ->
    Alerts.add "Google Analytics update failed. " + error, "danger"