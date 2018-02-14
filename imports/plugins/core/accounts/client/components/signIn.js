import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

/**
 * @summary React component to display sign in form
 * @memberof Accounts
 * @extends {Component}
 * @property {Object} credentials
 * @property {Boolean} isLoading
 * @property {Function} loginFormMessages
 * @property {Object} messages
 * @property {Function} onError
 * @property {Function} onForgotPasswordClick
 * @property {Function} onFormSubmit
 * @property {Function} onSignUpClick
 * @property {String} uniqueId
 */
class SignIn extends Component {
  static propTypes = {
    credentials: PropTypes.object,
    isLoading: PropTypes.bool,
    loginFormMessages: PropTypes.func,
    messages: PropTypes.object,
    onError: PropTypes.func,
    onForgotPasswordClick: PropTypes.func,
    onFormSubmit: PropTypes.func,
    onSignUpClick: PropTypes.func,
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
          <Components.Translation
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
            <Components.Translation
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
      <Components.Button
        className="btn-block"
        primary={true}
        bezelStyle="solid"
        i18nKeyLabel="accountsUI.signIn"
        label="Sign In"
        type="submit"
        eventAction="submitSignInForm"
      />
    );
  }

  render() {
    const emailClasses = classnames({
      "form-group": true,
      "form-group-email": true,
      "has-error has-feedback": this.props.onError(this.props.messages.errors && this.props.messages.errors.email)
    });

    const passwordClasses = classnames({
      "form-group": true,
      "has-error has-feedback": this.props.onError(this.props.messages.errors && this.props.messages.errors.password)
    });
    return (
      <div>
        <div className="loginForm-title">
          <h2>
            <Components.Translation defaultValue="Sign In" i18nKey="accountsUI.signIn" />
          </h2>
        </div>

        <form className="login-form" onSubmit={this.handleSubmit} noValidate>

          {this.renderFormMessages()}

          <div className={emailClasses}>
            <Components.TextField
              i18nKeyLabel="accountsUI.emailAddress"
              label="Email"
              name="email"
              type="email"
              id={`email-${this.props.uniqueId}`}
              value={this.state.email}
              onChange={this.handleFieldChange}
            />
            {this.renderEmailErrors()}
          </div>

          <div className={passwordClasses}>
            <Components.TextField
              i18nKeyLabel="accountsUI.password"
              label="Password"
              name="password"
              type="password"
              id={`password-${this.props.uniqueId}`}
              value={this.state.password}
              onChange={this.handleFieldChange}
            />
            {this.renderPasswordErrors()}
          </div>

          <div className="form-group">
            {this.renderSpinnerOnWait()}
          </div>

          <div className="form-group flex flex-justify-spaceBetween">
            <Components.Button
              tagName="span"
              className={{
                "btn": false,
                "btn-default": false
              }}
              label="Reset Password"
              i18nKeyLabel="accountsUI.forgotPassword"
              data-event-category="accounts"
              onClick={this.props.onForgotPasswordClick}
            />
            <Components.Button
              tagName="span"
              className={{
                "btn": false,
                "btn-default": false
              }}
              label="Register"
              i18nKeyLabel="accountsUI.signUp"
              data-event-category="accounts"
              onClick={this.props.onSignUpClick}
            />
          </div>

        </form>
      </div>
    );
  }
}

registerComponent("SignIn", SignIn);

export default SignIn;
