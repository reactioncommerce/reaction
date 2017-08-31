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
      showSpinner: false
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

    this.setState({ showSpinner: true });

    const { email } = this.state;

    Meteor.call("accounts/validation/email", email, false, (result, error) => {
      if (error.error) {
        Alerts.toast(i18next.t("accountsUI.error.invalidEmail", { err: error.reaston }), "error");
        this.setState({ showSpinner: false });
        return null;
      }

      Meteor.call("accounts/updateEmailAddress", email, (err) => {
        if (err) {
          Alerts.toast(i18next.t("accountsUI.error.emailAlreadyExists", { err: error.message }), "error");
          this.setState({ showSpinner: false });
        }
        // Email changed, remove original email
        if (!err) {
          Meteor.call("accounts/removeEmailAddress", this.props.email, () => {
            Alerts.toast(i18next.t("accountsUI.info.emailUpdated"), "success");
            this.setState({ showSpinner: false });
          });
        }
      });
    });

    return null;
  }

  renderSubmitButton() {
    if (this.state.showSpinner === true) {
      return (
        <Components.Button
          bezelStyle={"solid"}
          i18nKeyLabel={"accountsUI.updatingEmailAddress"}
          icon={"fa fa-spin fa-circle-o-notch"}
          label={"Updating Email Address"}
          status={"primary"}
          onClick={this.handleSubmit}
          disabled={!this.emailUpdate()}
        />
      );
    }

    return (
      <Components.Button
        bezelStyle={"solid"}
        i18nKeyLabel={"accountsUI.updateEmailAddress"}
        label={"Update Email Address"}
        status={"primary"}
        onClick={this.handleSubmit}
        disabled={!this.emailUpdate()}
      />
    );
  }

  render() {
    return (
      <div>
        <Components.TextField
          i18nKeyLabel="accountsUI.emailAddress"
          label="Email Address"
          name="email"
          type="email"
          id={`email-${this.props.uniqueId}`}
          value={this.state.email}
          onChange={this.handleFieldChange}
        />
        {this.renderSubmitButton()}
      </div>
    );
  }
}

export default UpdateEmail;
