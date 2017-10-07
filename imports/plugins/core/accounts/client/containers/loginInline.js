import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";
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

  /**
   * @method handleEmailSubmit
   * @summary Handle submitting the email form
   * @param {Event} event - the event that fired
   * @param {String} email - anonymous user's email
   * @return {undefined} undefined
   */
  handleEmailSubmit = (event, email) => {
    event.preventDefault();
    const userId = Meteor.userId();
    Meteor.call("cart/setAnonymousUserEmail", userId, email, (error) => {
      if (error) {
        Alerts.toast(i18next.t("mail.alerts.addCartEmailFailed"), "error");
      } else {
        Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin");
      }
    });
  }

  render() {
    return (
      <LoginInline
        continueAsGuest={this.continueAsGuest}
        renderEmailForm={this.state.renderEmailForm}
        handleEmailSubmit={this.handleEmailSubmit}
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
