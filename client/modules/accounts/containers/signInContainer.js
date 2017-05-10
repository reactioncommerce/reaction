import _ from "lodash";
import React, { Component, PropTypes } from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker } from "/lib/api/compose";
import { SignIn, LoginButtons } from "../components";
import { ServiceConfigHelper } from "../helpers";

class SignInContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formMessages: props.formMessages
    };

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.hasError = this.hasError.bind(this);
    this.formMessages = this.formMessages.bind(this);
    this.services = this.services.bind(this);
    this.shouldShowSeperator = this.shouldShowSeperator.bind(this);
  }

  handleFormSubmit = (event, email, password) => {
    event.preventDefault();
    const errors = {};
    const username = email.trim();
    const pword = password.trim();

    const validatedEmail = LoginFormValidation.email(username);
    const validatedPassword = LoginFormValidation.password(pword, { validationLevel: "exists" });

    if (validatedEmail !== true) {
      errors.email = validatedEmail;
    }

    if (validatedPassword !== true) {
      errors.password = validatedPassword;
    }

    if (_.isEmpty(errors) === false) {
      this.setState({
        formMessages: {
          errors: errors
        }
      });
      return;
    }

    Meteor.loginWithPassword(username, pword, (error) => {
      if (error) {
        this.setState({
          formMessages: {
            alerts: [error]
          }
        });
      }
    });
  }

  hasError = (error) => {
    // True here means the field is valid
    // We're checking if theres some other message to display
    if (error !== true && typeof error !== "undefined") {
      return true;
    }

    return false;
  }

  formMessages = () => {
    let reasons = "";
    if (this.state.formMessages.info) {
      this.state.formMessages.info.forEach(function (info) {
        reasons = info.reason;
      });
    } else if (this.state.formMessages.alerts) {
      this.state.formMessages.alerts.forEach(function (alert) {
        reasons = alert.reason;
      });
    }
    return reasons;
  }

  services = () => {
    const serviceHelper = new ServiceConfigHelper();
    return serviceHelper.services();
  }

  shouldShowSeperator = () => {
    const serviceHelper = new ServiceConfigHelper();
    const services = serviceHelper.services();
    const enabledServices = _.filter(services, {
      enabled: true
    });

    return !!Package["accounts-password"] && enabledServices.length > 0;
  }

  render() {
    return (
      <div>
        <LoginButtons
          loginServices={this.services}
          currentView={this.props.currentView}
          onSeparator={this.shouldShowSeperator}
        />
        <SignIn
          {...this.props}
          onFormSubmit={this.handleFormSubmit}
          messages={this.state.formMessages}
          onError={this.hasError}
          loginFormMessages={this.formMessages}
        />
      </div>
    );
  }
}

function composer(props, onData) {
  const formMessages = {};

  onData(null, {
    formMessages
  });
}

SignInContainer.propTypes = {
  currentView: PropTypes.string,
  formMessages: PropTypes.object
};

export default composeWithTracker(composer)(SignInContainer);
