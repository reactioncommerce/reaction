import React, { Component } from "react";
import {
  Button,
  TextField
} from "/imports/plugins/core/ui/client/components";

class SignUp extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="loginForm-title">
        <h2 data-i18n="accountsUI.createAccount">Create an Account</h2>
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

        <div className="form-group form-group-password {{hasError messages.errors.password }}">
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
            i18nKeyLabel="accountsUI.signUpButton"
            label="Register"
            type="submit"
            tabIndex="3"
            eventAction="register"
          />
        </div>

        <div className="form-group">
          <a data-i18n="accountsUI.signIn"  data-event-category="accounts" data-event-action="signIn" href>Sign In</a>
        </div>

      </form>
    </div>
    );
  }
}

export default SignUp;
