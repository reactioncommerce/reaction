import React, { Component } from "react";
import PropTypes from "prop-types";
import { Reaction } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";
import { ValidEmail } from "/lib/api";

/**
 * @summary React component to log in form in line
 * @memberof Accounts
 * @extends {Component}
 * @example <LoginInline
         continueAsGuest={this.continueAsGuest}
         renderEmailForm={this.state.renderEmailForm}
         handleEmailSubmit={this.handleEmailSubmit}
       />
 * @property {Function} continueAsGuest - On-click handler function
 * @property {Function} handleEmailSubmit - Required: E-mail submit function
 * @property {Boolean} renderEmailForm - Render e-mail form or not
 */
class LoginInline extends Component {
  static propTypes = {
    continueAsGuest: PropTypes.func,
    handleEmailSubmit: PropTypes.func.isRequired,
    renderEmailForm: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      email: "",
      isValid: true
    };
  }

  /**
   * @method handleFieldChange
   * @summary Handle setting state whenever the field on the form change
   * @param {Event} event - the event that fired
   * @param {String} value - the new value for the field
   * @param {String} field - which field to modify it's value
   * @return {undefined} undefined
   */
  handleFieldChange = (event, value, field) => {
    this.setState({
      [field]: value,
      isValid: true
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    if (!ValidEmail(this.state.email)) {
      this.setState({
        isValid: false
      });
    } else {
      this.setState({
        isValid: true
      });
      this.props.handleEmailSubmit(event, this.state.email);
    }
  }

  render() {
    if (this.props.renderEmailForm) {
      const validation = {
        messages: {
          email: {
            message: "Email is not valid",
            i18nKeyMessage: "checkoutLogin.invalidEmail"
          }
        }
      };
      return (
        <div className="accounts-dialog accounts-inline">
          <form onSubmit={this.handleSubmit} className="add-email-input">
            <Components.Translation
              defaultValue="Add your email address to receive order updates"
              i18nKey="{cartCompleted.registerGuest}"
            />
            <div>
              <Components.TextField
                name="email"
                type="email"
                value={this.state.email}
                onChange={this.handleFieldChange}
                isValid={this.state.isValid}
                validation={validation}
              />
              <Components.Button
                type="submit"
                label="Add email"
                i18nKeyLabel="checkoutLogin.addEmail"
                bezelStyle={"solid"}
              />
            </div>
          </form>
        </div>
      );
    }
    return (
      <div className="accounts-dialog accounts-inline">
        {Reaction.allowGuestCheckout() &&
          <div className="checkout-guest">
            <div className="guest-checkout">
              <p className="text-justify">
                <Components.Translation
                  defaultValue="Continue as a guest, and you can create an account later."
                  i18nKey="checkoutLogin.guestMessage"
                />
              </p>
              <Components.Button
                status="primary"
                buttonType="submit"
                bezelStyle="solid"
                className="btn-block login-button single-login-button continue-guest"
                i18nKeyLabel="checkoutLogin.continueAsGuest"
                label="Continue as guest"
                onClick={this.props.continueAsGuest}
              />
            </div>
          </div>
        }
        <div className="checkout-login">
          <Components.Login
            loginFormCurrentView="loginFormSignUpView"
          />
        </div>
      </div>
    );
  }
}

export default LoginInline;
