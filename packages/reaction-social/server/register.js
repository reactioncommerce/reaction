let DefaultSocialApp = {
  profilePage: "",
  enabled: false
};

ReactionCore.registerPackage({
  label: "Social",
  name: "reaction-social",
  icon: "fa fa-share-alt",
  autoEnable: true,
  settings: {
    public: {
      autoInit: true,
      apps: {
        facebook: _.extend({
          appId: void 0,
          version: "v2.1"
        }, DefaultSocialApp),
        twitter: _.extend({
          username: void 0
        }, DefaultSocialApp),
        googleplus: _.extend({}, DefaultSocialApp),
        pinterest: _.extend({}, DefaultSocialApp)
      },
      appsOrder: ["facebook", "twitter", "pinterest", "googleplus"],
      iconOnly: true,
      faSize: "fa-2x",
      faClass: "square",
      targetWindow: "_self"
    }
  },
  registry: [{
    provides: "dashboard",
    label: "Social",
    description: "Social Sharing for Reaction Commerce",
    route: "dashboard/social",
    icon: "fa fa-share-alt",
    cycle: "4",
    container: "dashboard",
    template: "socialDashboard"
  }, {
    label: "Social Settings",
    route: "dashboard/social",
    provides: "settings",
    template: "socialSettings"
  }, {
    template: "reactionSocial",
    provides: "social"
  }],
  permissions: [{
    label: "Social",
    permission: "dashboard/social",
    group: "Shop Settings"
  }]
});
