import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";

class UpdateEmail extends Component {
  static propTypes = {
    email: PropTypes.string,
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    loginFormMessages: PropTypes.func,
    messages: PropTypes.object,
    onCancel: PropTypes.func,
    onError: PropTypes.func,
    onFormSubmit: PropTypes.func,
    uniqueId: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      email: props.email,
      newEmail: false,
      showSpinner: true
    };

    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps() {
    this.setState({ showSpinner: false });
  }

  emailUpdate() {
    if (this.state.email === this.props.email) {
      return false;
    }

    return true;
  }

  handleFieldChange = (event, value, field) => {
    this.setState({
      [field]: value
    });
  }

  handleSubmit = (event) => {
    event.preventDefault;

    const { email } = this.state;

    Meteor.call("accounts/updateEmailAddress", email, (error) => {
      if (error) {
        Alerts.toast(i18next.t("accountsUI.error.emailAlreadyExists", { err: error.message }), "error");
      }
      // Email changed, remove original email
      if (!error) {
        Meteor.call("accounts/removeEmailAddress", this.props.email, () => {
          Alerts.toast(i18next.t("accountsUI.info.emailUpdated"), "success");
        });
      }
    });
  }

  // renderFormMessages() {
  //   if (this.props.loginFormMessages) {
  //     return (
  //       <div>
  //         {this.props.loginFormMessages()}
  //       </div>
  //     );
  //   }
  // }

  // renderPasswordErrors() {
  //   return (
  //     <span className="help-block">
  //       {this.props.onError(this.props.messages.errors && this.props.messages.errors.password) &&
  //       this.props.messages.errors.password.map((error, i) => (
  //         <Components.Translation
  //           key={i}
  //           defaultValue={error.reason}
  //           i18nKey={error.i18nKeyReason}
  //         />
  //       ))
  //       }
  //     </span>
  //   );
  // }

  // renderSpinnerOnWait() {
  //   if (this.props.isDisabled === true) {
  //     return (
  //       <div className="col-sm-6" style={{ textAlign: "center" }}>
  //         <i className="fa fa-spinner fa-spin"/>
  //       </div>
  //     );
  //   }
  //   return (
  //     <div className="col-sm-6">
  //       <Components.Button
  //         className="btn-block"
  //         primary={true}
  //         bezelStyle="solid"
  //         i18nKeyLabel="accountsUI.updatePasswordAndContinue"
  //         label="Update and continue"
  //         type="submit"
  //       />
  //     </div>
  //   );
  // }
  //
  // renderSpinnerOnLoad() {
  //   return (
  //     <div className="spinner-container">
  //       <div className="spinner"/>
  //     </div>
  //   );
  // }

  render() {
    const { showSpinner } = this.state;

    return (
      <div>
        <Components.TextField
          i18nKeyLabel="accountsUI.email"
          label="Email Address"
          name="email"
          type="email"
          id={`email-${this.props.uniqueId}`}
          value={this.state.email}
          onChange={this.handleFieldChange}
        />
        <Components.Button
          bezelStyle={"solid"}
          i18nKeyLabel={"accountsUI.email"}
          label={"Update Email Address"}
          status={"primary"}
          onClick={this.handleSubmit}
          disabled={!this.emailUpdate()}
        />
        {/* {this.renderPasswordErrors()} */}
      </div>
    );
  }
}

export default UpdateEmail;
