import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";
import merge from "lodash/merge";

export function createSocialSettings(options) {
  let socialSettings;

  const socialPackage = Packages.findOne({
    name: "reaction-social",
    shopId: Reaction.getShopId()
  });

  if (socialPackage) {
    socialSettings = socialPackage.settings.public;
    socialSettings = merge({}, socialSettings, options);
    const socialButtons = [];

    if (socialSettings.appsOrder) {
      const { appsOrder } = socialSettings;
      for (let inc = 0; inc < appsOrder.length; inc += 1) {
        const app = appsOrder[inc];

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
