import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "react-komposer";
import { Reaction } from "/client/api";
import { SocialButtons } from "../components";
import { Packages } from "/lib/collections";
import merge from "lodash/merge";

class SocialContainer extends Component {
  render() {
    return (
      <div className="social-container">
        <SocialButtons {...this.props} />
      </div>
    );
  }
}

function composer(props, onData) {
  onData(null, {});

  const subscription = Reaction.Subscriptions.Packages;
  let socialSettings;

  if (subscription.ready()) {
    const socialPackage = Packages.findOne({
      name: "reaction-social"
    });

    if (socialPackage) {
      socialSettings = socialPackage.settings.public;
      socialSettings = merge({}, socialSettings, props);
      const socialButtons = [];

      if (socialSettings.appsOrder) {
        const appsOrder = socialSettings.appsOrder;
        for (let i = 0; i < appsOrder.length; i++) {
          const app = appsOrder[i];

          if (typeof socialSettings.apps[app] === "object" && socialSettings.apps[app].enabled) {
            socialButtons.push(app);
          }
        }
      }

      onData(null, {
        url: props.url || location.origin + location.pathname,
        settings: socialSettings,
        providers: socialButtons
      });
    }
  }
}

const decoratedComponent = composeWithTracker(composer)(SocialContainer);

export default decoratedComponent;
