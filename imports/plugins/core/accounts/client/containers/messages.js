import React, { Component } from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";
import LoginFormMessages from "../components/loginFormMessages";

const wrapComponent = (Comp) => (
  class LoginFormMessagesContainer extends Component {
    static propTypes = {
      messages: PropTypes.object
    }

    constructor() {
      super();

      this.loginFormMessages = this.loginFormMessages.bind(this);
    }

    loginFormMessages = () => {
      let reasons = "";
      if (this.props.messages.info) {
        this.props.messages.info.forEach((info) => {
          reasons = info.reason;
        });
      } else if (this.props.messages.alerts) {
        this.props.messages.alerts.forEach((alert) => {
          reasons = alert.reason;
        });
      }
      return reasons;
    }

    render() {
      return (
        <Comp
          loginFormMessages={this.loginFormMessages}
          formMessages={this.props.messages}
        />
      );
    }
  }
);

registerComponent("LoginFormMessages", LoginFormMessages, wrapComponent);

export default wrapComponent(LoginFormMessages);
