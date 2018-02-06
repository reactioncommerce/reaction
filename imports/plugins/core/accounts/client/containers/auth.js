import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Router } from "/client/api";
import { ServiceConfigHelper, LoginFormSharedHelpers } from "../helpers";
import { LoginFormValidation } from "/lib/api";

class AuthContainer extends Component {
  static propTypes = {
    currentRoute: PropTypes.object,
    currentView: PropTypes.string,
    formMessages: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      formMessages: props.formMessages || {},
      isLoading: false
    };

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.hasError = this.hasError.bind(this);
    this.formMessages = this.formMessages.bind(this);
    this.services = this.services.bind(this);
    this.shouldShowSeperator = this.shouldShowSeperator.bind(this);
    this.handleSocialLogin = this.handleSocialLogin.bind(this);
    this.capitalizeName = this.capitalizeName.bind(this);
    this.hasPasswordService = this.hasPasswordService.bind(this);
  }

  handleFormSubmit = (event, email, password) => {
    event.preventDefault();

    this.setState({
      isLoading: true
    });
    const errors = {};
    const username = email ? email.trim() : null;
    const pword = password ? password.trim() : null;

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
        isLoading: false,
        formMessages: {
          errors
        }
      });
      return;
    }

    if (this.props.currentView === "loginFormSignInView") {
      Meteor.loginWithPassword(username, pword, (error) => {
        if (error) {
          this.setState({
            isLoading: false,
            formMessages: {
              alerts: [error]
            }
          });
        } else {
          Router.go(this.props.currentRoute.route.path);
        }
      });
    } else if (this.props.currentView === "loginFormSignUpView") {
      const newUserData = {
        email: username,
        password: pword
      };

      Accounts.createUser(newUserData, (error) => {
        if (error) {
          this.setState({
            isLoading: false,
            formMessages: {
              alerts: [error]
            }
          });
        } else {
          Router.go(this.props.currentRoute.route.path);
        }
      });
    }
  }

  hasError = (error) => {
    // True here means the field is valid
    // We're checking if theres some other message to display
    if (error !== true && typeof error !== "undefined") {
      return true;
    }

    return false;
  }

  formMessages = () => (
    <Components.LoginFormMessages
      messages={this.state.formMessages}
    />
  )

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

  capitalizeName = (str) => LoginFormSharedHelpers.capitalize(str)

  handleSocialLogin = (value) => {
    let serviceName = value;

    // Get proper service name
    if (serviceName === "meteor-developer") {
      serviceName = "MeteorDeveloperAccount";
    } else {
      serviceName = this.capitalizeName(serviceName);
    }

    const loginWithService = Meteor[`loginWith${serviceName}`];
    const options = {}; // use default scope unless specified

    loginWithService(options, (error) => {
      if (error) {
        this.setState({
          formMessages: {
            alerts: [error]
          }
        });
      }
    });
  }

  hasPasswordService = () => !!Package["accounts-password"]

  renderAuthView() {
    if (this.props.currentView === "loginFormSignInView") {
      return (
        <Components.SignIn
          {...this.props}
          onFormSubmit={this.handleFormSubmit}
          messages={this.state.formMessages}
          onError={this.hasError}
          loginFormMessages={this.formMessages}
          isLoading={this.state.isLoading}
        />
      );
    } else if (this.props.currentView === "loginFormSignUpView") {
      return (
        <Components.SignUp
          {...this.props}
          onFormSubmit={this.handleFormSubmit}
          messages={this.state.formMessages}
          onError={this.hasError}
          loginFormMessages={this.formMessages}
          hasPasswordService={this.hasPasswordService}
          isLoading={this.state.isLoading}
        />
      );
    }
  }

  render() {
    return (
      <div>
        <Components.LoginButtons
          loginServices={this.services}
          currentView={this.props.currentView}
          onSeparator={this.shouldShowSeperator}
          onSocialClick={this.handleSocialLogin}
          capitalizeName={this.capitalizeName}
        />
        {this.renderAuthView()}
      </div>
    );
  }
}

function composer(props, onData) {
  onData(null, { currentRoute: Router.current() });
}

registerComponent("AuthContainer", AuthContainer, composeWithTracker(composer));

export default composeWithTracker(composer)(AuthContainer);
