import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import ForgotPassword from "../components/forgotPassword";
import { LoginFormValidation } from "/lib/api";


class ForgotPasswordContainer extends Component {
  static propTypes = {
    formMessages: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      formMessages: props.formMessages || {},
      isLoading: false,
      isDisabled: false
    };

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.formMessages = this.formMessages.bind(this);
    this.hasError = this.hasError.bind(this);
  }

  handleFormSubmit = async (event, email, mutation) => {
    event.preventDefault();

    this.setState({
      isLoading: true
    });

    let newEmail;
    email === undefined ? newEmail = "" : newEmail = email;

    const emailAddress = newEmail.trim();
    const validatedEmail = LoginFormValidation.email(emailAddress);
    const errors = {};

    if (validatedEmail !== true) {
      errors.email = validatedEmail;
    }

    if (_.isEmpty(errors) === false) {
      this.setState({
        isLoading: false,
        formMessages: {
          errors
        }
      });
      return;
    }

    await mutation({
      variables: {
        input: {
          email: emailAddress
        }
      }
    });
  }

  formMessages = () => (
    <Components.LoginFormMessages
      messages={this.state.formMessages}
    />
  )

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
      <ForgotPassword
        {...this.props}
        onFormSubmit={this.handleFormSubmit}
        loginFormMessages={this.formMessages}
        messages={this.state.formMessages}
        onError={this.hasError}
        isLoading={this.state.isLoading}
        isDisabled={this.state.isDisabled}
      />
    );
  }
}

registerComponent("ForgotPassword", ForgotPasswordContainer);

export default ForgotPasswordContainer;
