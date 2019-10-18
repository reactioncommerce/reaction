import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Reaction, Router } from "/client/api";
import { LoginFormValidation } from "/lib/api";

class OAuthFormContainer extends Component {
  static propTypes = {
    currentRoute: PropTypes.object,
    formMessages: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      formMessages: props.formMessages || {},
      isLoading: false
    };
  }

  handleFormSubmit = (event, email, password) => {
    const currentRouteView = this.props.currentRoute.query.action;
    event.preventDefault();

    this.setState({
      isLoading: true
    });
    const errors = {};
    const username = email ? email.trim() : null;
    const pword = password ? password.trim() : null;

    const validatedEmail = LoginFormValidation.email(username);
    const validatedPassword = LoginFormValidation.password(pword, { validationLevel: "exists" });
    const challenge = Router.current().query.login_challenge;

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

    if (currentRouteView === "signin") {
      Meteor.loginWithPassword(username, pword, (error) => {
        if (error) {
          this.setState({
            isLoading: false,
            formMessages: {
              alerts: [error]
            }
          });
        } else {
          Meteor.call("oauth/login", { challenge }, (err, redirectUrl) => {
            window.location.href = redirectUrl;
          });
        }
      });
    } else {
      const newUserData = {
        email: username,
        password: pword,
        shopId: Reaction.getShopId()
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
          Meteor.call("oauth/login", { challenge }, (err, redirectUrl) => {
            window.location.href = redirectUrl;
          });
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

  hasPasswordService = () => !!Package["accounts-password"]

  renderAuthView() {
    const currentRouteView = this.props.currentRoute.query.action;

    if (currentRouteView === "signin") {
      return (
        <Components.SignIn
          {...this.props}
          onFormSubmit={this.handleFormSubmit}
          messages={this.state.formMessages}
          onError={this.hasError}
          hasSwitchLinks={false}
          loginFormMessages={this.formMessages}
          isLoading={this.state.isLoading}
        />
      );
    }
    return (
      <Components.SignUp
        {...this.props}
        onFormSubmit={this.handleFormSubmit}
        messages={this.state.formMessages}
        onError={this.hasError}
        hasSwitchLinks={false}
        loginFormMessages={this.formMessages}
        hasPasswordService={this.hasPasswordService}
        isLoading={this.state.isLoading}
      />
    );
  }

  render() {
    return (
      <div className="idp-form">
        {this.renderAuthView()}
      </div>
    );
  }
}

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  onData(null, { currentRoute: Router.current() });
}

registerComponent("OAuthFormContainer", OAuthFormContainer, composeWithTracker(composer));

export default composeWithTracker(composer)(OAuthFormContainer);
