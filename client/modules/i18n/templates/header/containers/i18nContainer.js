import React, { Component } from "react";
import { Reaction } from "/client/api";
import { Shops } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import Language from "../components/i18n";

class LanguageDropdownContainer extends Component {
  handleChange = (value) => {
    Meteor.users.update(Meteor.userId(), { $set: { "profile.lang": value } });
  }
  render() {
    return (
      <div>
        <Language
          {...this.props}
          handleChange={this.handleChange}
        />
      </div>
    );
  }
}

const composer = (props, onData) => {
  const languages = [];
  let currentLanguage = "";
  if (Reaction.Subscriptions.Shops.ready() && Meteor.user()) {
    const shop = Shops.findOne();
    if (typeof shop === "object" && shop.languages) {
      for (const language of shop.languages) {
        if (language.enabled === true) {
          language.translation = "languages." + language.label.toLowerCase();
          // appending a helper to let us know this
          // language is currently selected
          const profile = Meteor.user().profile;
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
  onData(null, {
    languages: languages,
    currentLanguage: currentLanguage
  });
};

export default composeWithTracker(composer, null)(LanguageDropdownContainer);


