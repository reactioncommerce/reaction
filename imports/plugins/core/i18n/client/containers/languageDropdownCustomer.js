import { compose, withProps } from "recompose";
import React, { Component } from "react";
import { Reaction } from "/client/api";
import { Meteor } from "meteor/meteor";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import withShop from "/imports/plugins/core/graphql/lib/hocs/withShop";
import withShopId from "/imports/plugins/core/graphql/lib/hocs/withShopId";
import LanguageDropdown from "../components/languageDropdown";

const handlers = {
  handleChange(value) {
    Meteor.users.update(Meteor.userId(), { $set: { "profile.lang": value } });
  }
};

const wrapComponent = (Comp) => (
  class LanguageDropdownCustomerContainer extends Component {
    render() {
      const languages = [];
      let currentLanguage = "";
      const { shop } = this.props;
      if (typeof shop === "object" && shop.languages) {
        for (const lang of shop.languages) {
          const language = Object.assign({}, lang);
          if (language.enabled === true) {
            language.translation = `languages.${language.label.toLowerCase()}`;
            // appending a helper to let us know this
            // language is currently selected
            const { profile } = Meteor.user() || {};
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
      return (
        <div>
          <Comp
            {...this.props}
            languages={languages}
            currentLanguage={currentLanguage}
          />
        </div>
      );
    }
  }
);

const composer = (props, onData) => {
  // Prevent loading GraphQL HOCs if we don't have a user account yet. All users (even anonymous) have accounts
  if (!Meteor.user()) {
    return;
  }
  onData(null, { ...props, shopSlug: Reaction.getSlug(Reaction.getShopName().toLowerCase()) });
};

registerComponent("LanguageDropdownCustomer", LanguageDropdown, [
  composeWithTracker(composer),
  withProps(handlers),
  withShopId,
  withShop,
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers),
  withShopId,
  withShop,
  wrapComponent
)(LanguageDropdown);
