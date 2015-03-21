###
# Settings for Social Package
###

ReactionCore.Schemas.SocialProvider = new SimpleSchema
  profilePage:
    type: String
    regEx: SimpleSchema.RegEx.Url
    label: 'Profile Page'
    optional: true
  enabled:
    type: Boolean
    defaultValue: false
    optional: true

ReactionCore.Schemas.SocialPackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig
  {
    "settings.public":
      type: Object
      optional: true
    "settings.public.apps":
      type: Object
      label: "Social Settings"
      optional: true
    "settings.public.apps.facebook":
      type: ReactionCore.Schemas.SocialProvider
      optional: true
    "settings.public.apps.facebook.appId":
      type: String
      regEx: /\d+/
      label: 'App Id'
      optional: true
    "settings.public.apps.facebook.appSecrect":
      type: String
      regEx: /[\da-z]+/
      label: 'App Secret'
      optional: true
    "settings.public.apps.twitter":
      type: ReactionCore.Schemas.SocialProvider
      optional: true
    "settings.public.apps.twitter.username":
      type: String
      optional: true
    "settings.public.apps.pinterest":
      type: ReactionCore.Schemas.SocialProvider
      optional: true
    "settings.public.apps.googleplus":
      type: ReactionCore.Schemas.SocialProvider
      label: 'Google+'
      optional: true
  }
])
