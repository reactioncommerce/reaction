import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import LoginInline from "../components/loginInline";

class LoginInlineContainer extends Component {
  static propTypes = {
    isStripeEnabled: PropTypes.bool
  }

  constructor(props) {
    super(props);

    this.state = {
      isStripeEnabled: props.isStripeEnabled,
      renderEmailForm: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isStripeEnabled: nextProps.isStripeEnabled
    });
  }

  continueAsGuest = (event) => {
    event.preventDefault();
    if (this.state.isStripeEnabled) {
      this.setState({
        renderEmailForm: true
      });
    } else {
      Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin");
    }
  }

  render() {
    return (
      <LoginInline
        continueAsGuest={this.continueAsGuest}
        renderEmailForm={this.state.renderEmailForm}
      />
    );
  }
}

function composer(props, onData) {
  let isStripeEnabled = false;
  const subscription = Reaction.Subscriptions.Packages;
  const primaryShopId = Reaction.getPrimaryShopId();

  const stripePkg = Reaction.getPackageSettingsWithOptions({
    shopId: primaryShopId,
    name: "reaction-stripe",
    enabled: true
  });

  if (subscription.ready()) {
    if (stripePkg) {
      isStripeEnabled = true;
    }

    onData(null, {
      isStripeEnabled
    });
  }
}

registerComponent("LoginInline", LoginInlineContainer, composeWithTracker(composer));

export default composeWithTracker(composer)(LoginInlineContainer);
