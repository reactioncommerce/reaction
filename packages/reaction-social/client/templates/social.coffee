Template.reactionSocial.onCreated ->
  _self = this
  subscription = @subscribe "Packages"
  if subscription.ready()
    _self.socialSettings = ReactionCore.Collections.Packages.findOne({name: 'reaction-social'}).settings.public

Template.reactionSocial.helpers
  settings: -> # this settings would be available in all social apps. e.g. facebook.html
    return Template.instance()?.socialSettings

  socialTemplates: ->
    templates = []
    # currentData is customSocialSettings coming from reactionApps loop
    Template.instance().socialSettings = $.extend(true, {}, Template.instance().socialSettings, Template.currentData())
    socialSettings = Template.instance()?.socialSettings
    if socialSettings.apps # apps not always ready
      for app in socialSettings?.appsOrder
        if socialSettings.apps[app]? and socialSettings.apps[app].enabled
          templates.push app
    return templates
