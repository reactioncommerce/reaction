import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components } from "@reactioncommerce/reaction-components";
import { Button, TextField, Translation } from "/imports/plugins/core/ui/client/components";

class Forgot extends Component {
  static propTypes = {
    credentials: PropTypes.object,
    isDisabled: PropTypes.bool,
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
      email: props.credentials.email
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
      this.props.onFormSubmit(event, this.state.email);
    }
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
        i18nKeyLabel="accountsUI.resetYourPassword"
        label="Reset Your Password"
        type="submit"
        eventAction="reset-password"
        disabled={this.props.isDisabled}
      />
    );
  }

  render() {
    const emailClasses = classnames({
      "form-group": true,
      "form-group-email": true,
      "has-error has-feedback": this.props.onError(this.props.messages.errors && this.props.messages.errors.email)
    });

    return (
      <div>
        <div className="loginForm-title">
          <h2>
            <Translation defaultValue="Reset your password" i18nKey="accountsUI.resetYourPassword" />
          </h2>
        </div>

        <form name="loginForm" onSubmit={this.handleSubmit} noValidate>

          {this.renderFormMessages()}

          <div className={emailClasses}>
            <TextField
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

          <div className="form-group">
            {this.renderSpinnerOnWait()}
          </div>

          <div className="form-group">
            <Components.Button
              tagName="span"
              className={{
                "btn": false,
                "btn-default": false
              }}
              label="Sign In"
              i18nKeyLabel="accountsUI.signIn"
              data-event-category="accounts"
              onClick={this.props.onSignInClick}
            />
          </div>

        </form>
      </div>
    );
  }
}

export default Forgot;
