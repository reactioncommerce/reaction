import _ from "lodash";
import React, { Component, PropTypes } from "react";
import { Accounts } from "meteor/accounts-base";
import { composeWithTracker } from "/lib/api/compose";
import { UpdatePasswordOverlay } from "/client/modules/accounts/components";
import { MessagesContainer } from "/client/modules/accounts/containers/helpers";

class UpdatePasswordOverlayContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formMessages: props.formMessages,
      isOpen: props.isOpen,
      isDisabled: false
    };

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleFormCancel = this.handleFormCancel.bind(this);
    this.formMessages = this.formMessages.bind(this);
    this.hasError = this.hasError.bind(this);
  }

  handleFormSubmit = (event, passwordValue) => {
    event.preventDefault();

    this.setState({
      isDisabled: true
    });

    const password = passwordValue.trim();
    const validatedPassword = LoginFormValidation.password(password);
    const errors = {};

    if (validatedPassword !== true) {
      errors.password = validatedPassword;
    }

    if (_.isEmpty(errors) === false) {
      this.setState({
        isDisabled: false,
        formMessages: {
          errors: errors
        }
      });
      return;
    }

    Accounts.resetPassword(this.props.token, password, (error) => {
      if (error) {
        this.setState({
          isDisabled: false,
          formMessages: {
            alerts: [error]
          }
        });
      } else {
        this.props.callback();

        this.setState({
          isOpen: !this.state.isOpen
        });
      }
    });
  }

  handleFormCancel = (event) => {
    event.preventDefault();
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  formMessages = () => {
    return (
      <MessagesContainer
        messages={this.state.formMessages}
      />
    );
  }

  hasError = (error) => {
    // True here means the field is valid
    // We're checking if theres some other message to display
    if (error !== true && typeof error !== "undefined") {
      return true;
    }

    return false;
  }

  render() {
    return (
      <UpdatePasswordOverlay
        {...this.props}
        loginFormMessages={this.formMessages}
        onError={this.hasError}
        messages={this.state.formMessages}
        onFormSubmit={this.handleFormSubmit}
        onCancel={this.handleFormCancel}
        isOpen={this.state.isOpen}
        isDisabled={this.state.isDisabled}
      />
    );
  }
}

function composer(props, onData) {
  const uniqueId = Random.id();
  const formMessages = {};

  onData(null, {
    uniqueId,
    formMessages
  });
}

UpdatePasswordOverlayContainer.propTypes = {
  callback: PropTypes.func,
  formMessages: PropTypes.object,
  isOpen: PropTypes.bool,
  token: PropTypes.string
};

export default composeWithTracker(composer)(UpdatePasswordOverlayContainer);
