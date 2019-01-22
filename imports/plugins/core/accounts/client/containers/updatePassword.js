import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Random from "@reactioncommerce/random";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Router } from "/client/api";
import { LoginFormValidation } from "/lib/api";
import UpdatePassword from "../components/updatePassword";

const wrapComponent = (Comp) => (
  class UpdatePasswordContainer extends Component {
    static propTypes = {
      callback: PropTypes.func,
      formMessages: PropTypes.object,
      isOpen: PropTypes.bool,
      onCompleteRoute: PropTypes.string,
      type: PropTypes.string,
      uniqueId: PropTypes.string
    }

    static defaultProps = {
      formMessages: {},
      uniqueId: Random.id()
    }

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
            errors
          }
        });
        return;
      }
      const { token } = Router.current().params;
      Accounts.resetPassword(token, password, (error) => {
        if (error) {
          this.setState({
            isDisabled: false,
            formMessages: {
              alerts: [error]
            }
          });
        } else {
          // Now that Meteor.users is verified, we should do the same with the Accounts collection
          Meteor.call("accounts/verifyAccount");
          Router.go(this.props.onCompleteRoute);
        }
      });
    }

    handleFormCancel = (event) => {
      event.preventDefault();
      this.setState({
        isOpen: !this.state.isOpen
      });
    }

    formMessages = () => (
      <Components.LoginFormMessages messages={this.state.formMessages} />
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
      const { status } = Router.current().params;
      if (status === "completed") {
        return (
          <div className="idp-form col-sm-4 col-sm-offset-4">
            <div className="loginForm-title">
              <h3>
                <Components.Translation
                  defaultValue="Password Reset Successful"
                  i18nKey="accountsUI.info.passwordResetDone"
                />
              </h3>
            </div>
            <p className="text-center">
              <Components.Translation
                defaultValue="Return to the app to continue"
                i18nKey="accountsUI.info.passwordResetDoneText"
              />
            </p>
          </div>
        );
      }
      return (
        <Comp
          uniqueId={this.props.uniqueId}
          loginFormMessages={this.formMessages}
          onError={this.hasError}
          messages={this.state.formMessages}
          onFormSubmit={this.handleFormSubmit}
          onCancel={this.handleFormCancel}
          isOpen={this.state.isOpen}
          isDisabled={this.state.isDisabled}
          type={this.props.type}
        />
      );
    }
  }
);

registerComponent("UpdatePassword", UpdatePassword, wrapComponent);

export default wrapComponent(UpdatePassword);
