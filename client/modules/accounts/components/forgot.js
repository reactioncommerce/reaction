import React, { Component, PropTypes } from "react";
import {
  Button,
  TextField
} from "/imports/plugins/core/ui/client/components";

class Forgot extends Component {
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

  render() {
    return (
      <div>
        <div className="loginForm-title">
          <h2 data-i18n="accountsUI.resetYourPassword">Reset your password</h2>
        </div>

        <form name="loginForm" onSubmit={this.handleSubmit}>

          <div className="form-group {{hasError messages.errors.email}}">
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
  onFormSubmit: PropTypes.func,
  onSignInClick: PropTypes.func,
  uniqueId: PropTypes.string
};

export default Forgot;
