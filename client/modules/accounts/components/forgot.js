import React, { Component, PropTypes } from "react";
import {
  Button,
  TextField
} from "/imports/plugins/core/ui/client/components";

class Forgot extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="loginForm-title">
          <h2 data-i18n="accountsUI.resetYourPassword">Reset your password</h2>
        </div>

        <form name="loginForm" noValidate>

          <div className="form-group {{hasError messages.errors.email}}">
            <TextField
              i18nKeyLabel="accountsUI.emailAddress"
              label="Email"
              className="form-control login-input-email"
              type="email"
              tabIndex="1"
              id={`email-${this.props.uniqueId}`}
              value={this.props.credentials.email}
            />
          </div>

          <div className="form-group">
            <Button
              className="btn-block"
              primary={true}
              bezelStyle="solid"
              i18nKeyLabel="accountsUI.resetYourPassword"
              label="Reset Your Password"
              type="submit"
              tabIndex="2"
              eventAction="reset-password"
            />
          </div>

          <div className="form-group">
            <a
              href="#"
              data-i18n="accountsUI.signIn"
              tabIndex="3"
              data-event-category="accounts"
              onDoubleClick={this.props.onSignInClick}
            >
            Sign In
            </a>
          </div>

        </form>
      </div>
    );
  }
}

Forgot.propTypes = {
  credentials: PropTypes.object,
  onSignInClick: PropTypes.func,
  uniqueId: PropTypes.string
};

export default Forgot;
