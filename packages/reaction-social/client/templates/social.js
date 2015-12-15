Template.reactionSocial.onCreated(function() {
  var _self;
  _self = this;
  return this.autorun(function() {
    var subscription;
    subscription = _self.subscribe("Packages");
    if (subscription.ready()) {
      return _self.socialSettings = ReactionCore.Collections.Packages.findOne({
        name: 'reaction-social'
      }).settings["public"];
    }
  });
});

Template.reactionSocial.helpers({
  settings: function() {
    var ref;
    return (ref = Template.instance()) != null ? ref.socialSettings : void 0;
  },
  socialTemplates: function() {
    var app, i, len, ref, ref1, socialSettings, templates;
    templates = [];
    Template.instance().socialSettings = $.extend(true, {}, Template.instance().socialSettings, Template.currentData());
    socialSettings = (ref = Template.instance()) != null ? ref.socialSettings : void 0;
    if (socialSettings.apps) {
      ref1 = socialSettings != null ? socialSettings.appsOrder : void 0;
      for (i = 0, len = ref1.length; i < len; i++) {
        app = ref1[i];
        if ((socialSettings.apps[app] != null) && socialSettings.apps[app].enabled) {
          templates.push(app);
        }
      }
    }
    return templates;
  }
});
