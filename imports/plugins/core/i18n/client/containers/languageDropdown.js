import { compose, withProps } from "recompose";
import { Reaction } from "/client/api";
import { Meteor } from "meteor/meteor";
import { Shops } from "/lib/collections";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import LanguageDropdown from "../components/languageDropdown";

const handlers = {
  handleChange(value) {
    Meteor.users.update(Meteor.userId(), { $set: { "profile.lang": value } });
  }
};

const composer = (props, onData) => {
  const languages = [];
  let currentLanguage = "";

  if (Reaction.Subscriptions.PrimaryShop.ready() &&
      Reaction.Subscriptions.MerchantShops.ready() && Meteor.user()) {
    let shopId;

    // Choose shop to get language from
    if (Reaction.marketplaceEnabled && Reaction.merchantLanguage) {
      shopId = Reaction.getShopId();
    } else {
      shopId = Reaction.getPrimaryShopId();
    }

    const shop = Shops.findOne({
      _id: shopId
    });

    if (typeof shop === "object" && shop.languages) {
      for (const language of shop.languages) {
        if (language.enabled === true) {
          language.translation = `languages.${language.label.toLowerCase()}`;
          // appending a helper to let us know this
          // language is currently selected
          const { profile } = Meteor.user();
          if (profile && profile.lang) {
            if (profile.lang === language.i18n) {
              currentLanguage = profile.lang;
            }
          } else if (shop.language === language.i18n) {
            // we don't have a profile language
            // use the shop default
            currentLanguage = shop.language;
          }
          languages.push(language);
        }
      }
    }
  }
  onData(null, { languages, currentLanguage });
};

registerComponent("LanguageDropdown", LanguageDropdown, [
  composeWithTracker(composer),
  withProps(handlers)
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers)
)(LanguageDropdown);
