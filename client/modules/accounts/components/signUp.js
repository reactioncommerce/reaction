import React, { Component, PropTypes } from "react";
import {
  Button,
  TextField
} from "/imports/plugins/core/ui/client/components";

class SignUp extends Component {

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
        <h2 data-i18n="accountsUI.createAccount">Create an Account</h2>
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

        <div className="form-group form-group-password {{hasError messages.errors.password }}">
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
            i18nKeyLabel="accountsUI.signUpButton"
            label="Register"
            type="submit"
            tabIndex="3"
            eventAction="register"
          />
        </div>

        <div className="form-group">
          <a
            href="#"
            data-i18n="accountsUI.signIn"
            tabIndex="4"
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

SignUp.propTypes = {
  credentials: PropTypes.object,
  onFormSubmit: PropTypes.func,
  onSignInClick: PropTypes.func,
  uniqueId: PropTypes.string
};

export default SignUp;
