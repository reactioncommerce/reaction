import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components } from "@reactioncommerce/reaction-components";

class UpdatePassword extends Component {
  static propTypes = {
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    loginFormMessages: PropTypes.func,
    messages: PropTypes.object,
    onCancel: PropTypes.func,
    onError: PropTypes.func,
    onFormSubmit: PropTypes.func,
    type: PropTypes.string,
    uniqueId: PropTypes.string
  }

  constructor() {
    super();

    this.state = {
      password: "",
      showSpinner: true
    };

    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  // eslint-disable-next-line camelcase
  async UNSAFE_componentWillMount() {
    await this.setState({ showSpinner: false });
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps() {
    this.setState({ showSpinner: false });
  }

  handleFieldChange = (event, value, field) => {
    this.setState({
      [field]: value
    });
  }

  handleSubmit = (event) => {
    if (this.props.onFormSubmit) {
      this.props.onFormSubmit(event, this.state.password);
    }
  }

  handleCancel = (event) => {
    if (this.props.onCancel) {
      this.props.onCancel(event);
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

    return null;
  }

  renderPasswordErrors() {
    return (
      <span className="help-block">
        {this.props.onError(this.props.messages.errors && this.props.messages.errors.password) &&
        this.props.messages.errors.password.map((error, index) => (
          <Components.Translation
            key={index}
            defaultValue={error.reason}
            i18nKey={error.i18nKeyReason}
          />
        ))
        }
      </span>
    );
  }

  renderSpinnerOnWait() {
    const { type } = this.props;
    if (this.props.isDisabled === true) {
      return (
        <div className="col-sm-6" style={{ textAlign: "center" }}>
          <i className="fa fa-spinner fa-spin"/>
        </div>
      );
    }

    if (type === "setPassword") {
      return (
        <Components.Button
          className="btn-block"
          primary={true}
          bezelStyle="solid"
          i18nKeyLabel="accountsUI.setPassword"
          label="Set your password"
          type="submit"
        />
      );
    }

    return (
      <Components.Button
        className="btn-block"
        primary={true}
        bezelStyle="solid"
        i18nKeyLabel="accountsUI.submit"
        label="Submit"
        type="submit"
        disabled={this.props.isDisabled}
      />
    );
  }

  renderSpinnerOnLoad() {
    return (
      <div className="spinner-container">
        <div className="spinner"/>
      </div>
    );
  }

  renderPasswordResetText() {
    const { type } = this.props;

    if (type === "setPassword") {
      return (
        <Components.Translation defaultValue="Set Your Password" i18nKey="accountsUI.setPassword"/>
      );
    }

    return (
      <Components.Translation defaultValue="Set New Password" i18nKey="accountsUI.updateYourPassword"/>
    );
  }

  render() {
    const passwordClasses = classnames({
      "form-group": true,
      "has-error has-feedback": this.props.onError(this.props.messages.errors && this.props.messages.errors.password)
    });
    const { showSpinner } = this.state;

    return (
      <div>
        {this.props.isOpen === true &&
          <div className="idp-form col-xs-12">
            {showSpinner ? this.renderSpinnerOnLoad() :
              <form onSubmit={this.handleSubmit}>
                <div className="loginForm-title">
                  <h2>
                    {this.renderPasswordResetText()}
                  </h2>
                </div>
                <div className="login-form">

                  {this.renderFormMessages()}

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
                </div>

                <div className="form-group">
                  {this.renderSpinnerOnWait()}
                </div>
              </form>
            }
          </div>
        }
      </div>
    );
  }
}

export default UpdatePassword;
