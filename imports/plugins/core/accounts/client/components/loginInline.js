import React, { Component } from "react";
import PropTypes from "prop-types";
import { Reaction } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";

class LoginInline extends Component {
  static propTypes = {
    continueAsGuest: PropTypes.func,
    renderEmailForm: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      email: ""
    };
  }

  /**
   * @summary handle setting state whenever the field on the form change
   * @param {Event} event - the event that fired
   * @param {String} value - the new value for the field
   * @param {String} field - which field to modify it's value
   * @return {null} null
   */
  handleFieldChange = (event, value, field) => {
    this.setState({
      [field]: value
    });
  };

  /**
   * @summary Handle submitting the email form
   * @param {Event} event - the event that fired
   * @returns {null} null
   */
  handleSubmit = (event) => {
    event.preventDefault();
    console.log("HERE", this.state);
  }

  render() {
    if (this.props.renderEmailForm) {
      return (
        <div className="accounts-dialog accounts-inline">
          <form onSubmit={this.handleSubmit} className="add-email-input">
            <Components.Translation defaultValue="Hello! Add an email and receive order updates" i18nKey="{cartCompleted.registerGuest}" />
            <div>
              <Components.TextField
                name="email"
                type="email"
                tabIndex="1"
                value={this.state.email}
                onChange={this.handleFieldChange}
              />
              <Components.Button
                type="submit"
                label="Add Email"
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
                label="Continue as Guest"
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
