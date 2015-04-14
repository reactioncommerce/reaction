Template.corePaymentMethods.helpers
  ###
  # app details defaults the icon and label to the package dashboard settings
  # but you can override by setting in the package registry
  # eventually admin editable as well.
  # label is also translated with checkoutPayment.{{app name}}.label
  ###
  isOpen: (current) ->
    if current.priority is 0
      return "in"

  appDetails: (current) ->
    self = this
    unless @.icon and @.label
      app = ReactionCore.Collections.Packages.findOne(@.packageId)
      for registry in app.registry when registry.provides is 'dashboard'
        self.icon = registry.icon
        self.label = registry.label
    return self
