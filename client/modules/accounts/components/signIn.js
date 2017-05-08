import React, { Component, PropTypes } from "react";
import {
  Button,
  TextField
} from "/imports/plugins/core/ui/client/components";

class SignIn extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: props.credentials.email,
      password: props.credentials.password
    };

    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleFieldChange = (event, value, field) => {
    this.setState({
      [field]: value
    });
  }

  handleSubmit = (event) => {
    if (this.props.onFormSubmit) {
      this.props.onFormSubmit(event, this.state.email, this.state.password);
    }
  }

  render() {
    return (
      <div>
        <div className="loginForm-title">
          <h2 data-i18n="accountsUI.signIn">Sign In</h2>
        </div>

        <form className="login-form" onSubmit={this.handleSubmit}>

          <div className="form-group form-group-email {{hasError messages.errors.email}}">
            <TextField
              i18nKeyLabel="accountsUI.emailAddress"
              label="Email"
              name="email"
              type="email"
              tabIndex="1"
              id={`email-${this.props.uniqueId}`}
              value={this.state.email}
              onChange={this.handleFieldChange}
            />
          </div>

          <div className="form-group {{hasError messages.errors.password }}">
            <TextField
              i18nKeyLabel="accountsUI.password"
              label="Password"
              name="password"
              type="password"
              tabIndex="2"
              id={`password-${this.props.uniqueId}`}
              value={this.state.password}
              onChange={this.handleFieldChange}
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
            <a
              href="#"
              data-i18n="accountsUI.forgotPassword"
              tabIndex="4"
              onDoubleClick={this.props.onForgotPasswordClick}
            >
              Reset Password
            </a>
            <a
              href="#"
              data-i18n="accountsUI.signUp"
              tabIndex="5"
              onDoubleClick={this.props.onSignUpClick}
            >
              Register
            </a>
          </div>

        </form>
      </div>
    );
  }
}

SignIn.propTypes = {
  credentials: PropTypes.object,
  onForgotPasswordClick: PropTypes.func,
  onFormSubmit: PropTypes.func,
  onSignUpClick: PropTypes.func,
  uniqueId: PropTypes.string
};

export default SignIn;
