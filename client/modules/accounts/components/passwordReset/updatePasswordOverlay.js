import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import {
  Button,
  TextField,
  Translation
} from "/imports/plugins/core/ui/client/components";

class UpdatePasswordOverlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      password: ""
    };
  }

  handleFieldChange = (event, value, field) => {
    this.setState({
      [field]: value
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    console.log("I WAS CLICKED", this.state.password);
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

  render() {
    const passwordClasses = classnames({
      "form-group": true,
      "has-error has-feedback": this.props.onError(this.props.messages.errors && this.props.messages.errors.password)
    });

    return (
      <div>
        <div className="modal-backdrop fade in" id={`modal-backdrop-${this.props.uniqueId}`} />
        <div className="modal fade in" id={`modal-${this.props.uniqueId}`} style={{ display: "block" }}>
          <div className="modal-dialog">

            <form className="modal-content" onSubmit={this.handleSubmit}>
              <div className="modal-header">
                <h4 className="modal-title" data-i18n="accountsUI.updateYourPassword">Update Your Password</h4>
              </div>

              <div className="modal-body">
                <div className="login-form">

                  {this.renderFormMessages()}

                  <div className={passwordClasses}>
                      <TextField
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
              </div>

              <div className="modal-footer">
                <Button
                  className="btn-block"
                  primary={true}
                  bezelStyle="solid"
                  i18nKeyLabel="accountsUI.updatePasswordAndContinue"
                  label="Update and continued"
                  type="submit"
                />
              </div>

            </form>
          </div>
        </div>
      </div>
    );
  }
}

UpdatePasswordOverlay.propTypes = {
  loginFormMessages: PropTypes.func,
  messages: PropTypes.object,
  onError: PropTypes.func,
  uniqueId: PropTypes.string
};

export default UpdatePasswordOverlay;
