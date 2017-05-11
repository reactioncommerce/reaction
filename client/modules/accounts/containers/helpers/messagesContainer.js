import React, { Component, PropTypes } from "react";
import { LoginFormMessages } from "../../components";

class MessagesContainer extends Component {
  constructor(props) {
    super(props);

    this.loginFormMessages = this.loginFormMessages.bind(this);
  }

  loginFormMessages = () => {
    let reasons = "";
    if (this.props.messages.info) {
      this.props.messages.info.forEach(function (info) {
        reasons = info.reason;
      });
    } else if (this.props.messages.alerts) {
      this.props.messages.alerts.forEach(function (alert) {
        reasons = alert.reason;
      });
    }
    return reasons;
  }

  render() {
    return (
      <LoginFormMessages
        loginFormMessages={this.loginFormMessages}
        formMessages={this.props.messages}
      />
    );
  }
}

MessagesContainer.propTypes = {
  messages: PropTypes.object
};

export default MessagesContainer;
