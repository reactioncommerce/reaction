import { Packages } from "/lib/collections";
import merge from "lodash/merge";

export function createSocialSettings(options) {
  let socialSettings;

  const socialPackage = Packages.findOne({
    name: "reaction-social"
  });

  if (socialPackage) {
    socialSettings = socialPackage.settings.public;
    socialSettings = merge({}, socialSettings, options);
    const socialButtons = [];

    if (socialSettings.appsOrder) {
      const { appsOrder } = socialSettings;
      for (let i = 0; i < appsOrder.length; i += 1) {
        const app = appsOrder[i];

        if (typeof socialSettings.apps[app] === "object" && socialSettings.apps[app].enabled) {
          socialButtons.push(app);
        }
      }
    }

    return {
      url: options.url || location.origin + location.pathname,
      media: options.media,
      settings: socialSettings,
      providers: socialButtons
    };
  }

  return null;
}
