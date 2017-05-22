import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import {
  Button,
  TextField,
  Translation
} from "/imports/plugins/core/ui/client/components";

class SignUp extends Component {
  static propTypes = {
    credentials: PropTypes.object,
    hasPasswordService: PropTypes.func,
    isLoading: PropTypes.bool,
    loginFormMessages: PropTypes.func,
    messages: PropTypes.object,
    onError: PropTypes.func,
    onFormSubmit: PropTypes.func,
    onSignInClick: PropTypes.func,
    uniqueId: PropTypes.string
  }

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

  renderEmailErrors() {
    if (this.props.onError(this.props.messages.errors && this.props.messages.errors.email)) {
      return (
        <span className="help-block">
          <Translation
            defaultValue={this.props.messages.errors.email.reason}
            i18nKey={this.props.messages.errors.email.i18nKeyReason}
          />
        </span>
      );
    }
  }

  renderPasswordErrors() {
    return (
      <span className="help-block">
        {this.props.onError(this.props.messages.errors && this.props.messages.errors.password) &&
          this.props.messages.errors.password.map((error, i) => (
            <Translation
              key={i}
              defaultValue={error.reason}
              i18nKey={error.i18nKeyReason}
            />
          ))
        }
      </span>
    );
  }

  renderFormMessages() {
    if (this.props.loginFormMessages) {
      return (
        <div>
          {this.props.loginFormMessages()}
        </div>
      );
    }
  }

  renderSpinnerOnWait() {
    if (this.props.isLoading === true) {
      return (
        <div style={{ textAlign: "center" }}>
          <i className="fa fa-spinner fa-spin" />
        </div>
      );
    }
    return (
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
    );
  }

  renderForm(emailClasses, passwordClasses) {
    if (this.props.hasPasswordService()) {
      return (
        <form className="login-form" onSubmit={this.handleSubmit} noValidate>

          {this.renderFormMessages()}

          <div className={emailClasses}>
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
            {this.renderEmailErrors()}
          </div>

          <div className={passwordClasses}>
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
          {this.renderPasswordErrors()}
          </div>

          <div className="form-group">
            {this.renderSpinnerOnWait()}
          </div>

          <div className="form-group">
            <a
              href="#"
              data-i18n="accountsUI.signIn"
              tabIndex="4"
              data-event-category="accounts"
              onClick={this.props.onSignInClick}
            >
              Sign In
            </a>
          </div>
        </form>
      );
    }
  }

  render() {
    const emailClasses = classnames({
      "form-group": true,
      "form-group-email": true,
      "has-error has-feedback": this.props.onError(this.props.messages.errors && this.props.messages.errors.email)
    });

    const passwordClasses = classnames({
      "form-group": true,
      "form-group-password": true,
      "has-error has-feedback": this.props.onError(this.props.messages.errors && this.props.messages.errors.password)
    });
    return (
      <div>
        <div className="loginForm-title">
        <h2 data-i18n="accountsUI.createAccount">Create an Account</h2>
      </div>

      {this.renderForm(emailClasses, passwordClasses)}

    </div>
    );
  }
}

export default SignUp;
