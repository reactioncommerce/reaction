import React, { Component } from "react";
import {
  Button,
  TextField
} from "/imports/plugins/core/ui/client/components";

class SignIn extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="loginForm-title">
          <h2 data-i18n="accountsUI.signIn">Sign In</h2>
        </div>

        <form className="login-form" noValidate>

          <div className="form-group form-group-email {{hasError messages.errors.email}}">
            <TextField
              i18nKeyLabel="accountsUI.emailAddress"
              label="Email"
              className="form-control login-input-email"
              type="email"
              tabIndex="1"
              id="email-{{uniqueId}}"
            />
          </div>

          <div className="form-group {{hasError messages.errors.password }}">
            <TextField
              i18nKeyLabel="accountsUI.password"
              label="Password"
              className="form-control login-input-password"
              type="password"
              tabIndex="2"
              id="password-{{uniqueId}}"
            />
          </div>

          <div className="form-group">
            <Button
              className="btn-block"
              primary={true}
              bezelStyle="solid"
              i18nKeyLabel="accountsUI.signIn"
              label="Sign In"
              type="submit"
              tabIndex="3"
              eventAction="submitSignInForm"
            />
          </div>

          <div className="form-group flex flex-justify-spaceBetween">
            <a data-i18n="accountsUI.forgotPassword" href tabIndex="4" data-event-action="forgotPassword">Reset Password</a>
            <a data-i18n="accountsUI.signUp" href tabIndex="5" data-event-action="signUp">Register</a>
          </div>

        </form>
      </div>
    );
  }

}

export default SignIn;
