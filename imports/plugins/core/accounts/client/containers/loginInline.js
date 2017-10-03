import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { registerComponent } from "@reactioncommerce/reaction-components";
import LoginInline from "../components/loginInline";

class LoginInlineContainer extends Component {
  continueAsGuest = (event) => {
    event.preventDefault();
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin");
  }

  render() {
    return (
      <LoginInline
        continueAsGuest={this.continueAsGuest}
      />
    );
  }
}

registerComponent("LoginInline", LoginInlineContainer);

export default LoginInlineContainer;
