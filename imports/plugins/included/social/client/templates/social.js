import { merge } from "lodash";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";

Template.reactionSocial.onCreated(function () {
  const self = this;
  return this.autorun(() => {
    const subscription = Reaction.Subscriptions.Packages;
    if (subscription.ready()) {
      const socialSettings = Packages.findOne({
        name: "reaction-social"
      });
      if (socialSettings) {
        self.socialSettings = socialSettings.settings.public;
      }
    }
  });
});

Template.reactionSocial.helpers({
  settings() {
    const template = Template.instance();
    return template && template.socialSettings;
  },
  socialTemplates() {
    const templates = [];
    const template = Template.instance();

    if (template && template.socialSettings) {
      let { socialSettings } = template;
      socialSettings = merge({}, socialSettings, Template.currentData());

      if (socialSettings.appsOrder) {
        const { appsOrder } = socialSettings;

        for (let i = 0; i < appsOrder.length; i += 1) {
          const app = appsOrder[i];

          if (typeof socialSettings.apps[app] === "object" &&
            socialSettings.apps[app].enabled) {
            templates.push(app);
          }
        }
      }
    }
    return templates;
  }
});
