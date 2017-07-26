import React, { Component } from "react";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { SocialButtons } from "../components";
import { createSocialSettings } from "../../lib/helpers";

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
  const subscription = Reaction.Subscriptions.Packages;

  if (subscription.ready()) {
    const socialSettings = createSocialSettings(props);
    onData(null, socialSettings);
  } else {
    onData(null, {});
  }
}

const decoratedComponent = composeWithTracker(composer)(SocialContainer);

export default decoratedComponent;
