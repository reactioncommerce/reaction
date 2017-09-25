import _ from "lodash";
import { Reaction } from "/server/api";

const DefaultSocialApp = {
  profilePage: "",
  enabled: false
};

Reaction.registerPackage({
  label: "Social",
  name: "reaction-social",
  icon: "fa fa-share-alt",
  autoEnable: true,
  settings: {
    public: {
      autoInit: true,
      apps: {
        facebook: _.extend({
          appId: "",
          version: "v2.1"
        }, DefaultSocialApp),
        twitter: _.extend({
          username: ""
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
    provides: ["dashboard"],
    label: "Social",
    description: "Social Channel configuration",
    icon: "fa fa-share-alt",
    priority: 2,
    container: "connect",
    permissions: [{
      label: "Social",
      permission: "dashboard/social"
    }]
  }, {
    label: "Social Settings",
    icon: "fa fa-share-alt",
    route: "/dashboard/social",
    provides: ["settings"],
    container: "dashboard",
    template: "socialSettings"
  }, {
    template: "reactionSocial",
    provides: ["social"]
  }]
});
