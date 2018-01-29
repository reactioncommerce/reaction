import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { registerComponent, Components } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import ReactionAlerts from "/imports/plugins/core/layout/client/templates/layout/alerts/inlineAlerts";

class InviteOwner extends Component {
  constructor() {
    super();
    this.state = {
      alertId: "admin-invite-form",
      name: "",
      email: "",
      group: "",
      isLoading: false
    };
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  removeAlert = (oldAlert) => this.setState({
    alertArray: this.state.alertArray.filter((alert) => JSON.stringify(alert) === JSON.stringify(oldAlert))
  });

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ isLoading: true });
    const { name, email, alertId } = this.state;
    const alertOptions = { placement: alertId, id: alertId, autoHide: 4000 };

    Meteor.call("accounts/inviteShopOwner", { name, email }, (error, result) => {
      let message = "";
      if (error) {
        let messageKey;
        if (error.reason === "Unable to send invitation email.") {
          messageKey = "accountsUI.error.unableToSendInvitationEmail";
        } else if (error.reason !== "") {
          message = error.reason;
        } else {
          messageKey = "accountsUI.error.errorSendingEmail";
        }
        ReactionAlerts.add(message, "danger", Object.assign({}, alertOptions, { i18nKey: messageKey }));
      }

      this.setState({ isLoading: false });

      if (result) {
        this.setState({ name: "", email: "" });
        Alerts.toast(i18next.t("accountsUI.info.invitationSent"), "success");
      }
    });
  }

  renderSpinnerButton() {
    if (this.state.isLoading) {
      return (
        <div style={{ textAlign: "center" }}>
          <i className="fa fa-spinner fa-spin" />
        </div>
      );
    }
    return (
      <Components.Button
        status="primary"
        onClick={this.handleSubmit}
        bezelStyle="solid"
        buttonType="submit"
        i18nKeyLabel="accountsUI.info.sendInvitation"
        label="Send Invitation"
      />
    );
  }

  render() {
    return (
      <div className="panel panel-default admin-invite-form">
        <h4 style={{ textAlign: "center" }}>Invite Owner Form</h4>
        <Components.Alerts placement={this.state.alertId} id={this.state.alertId} onAlertRemove={this.removeAlert} />
        <div className="panel-body">
          <form className="invite-owner" onSubmit={this.handleSubmit}>
            <div className="form-group">
              <Components.TextField
                i18nKeyLabel="accountsUI.name"
                label="Name"
                name="name"
                id="member-form-name"
                type="text"
                i18nKeyPlaceholder="admin.groupsInvite.name"
                value={this.state.name}
                onChange={this.onChange}
              />
            </div>
            <div className="form-group">
              <Components.TextField
                i18nKeyLabel="accountsUI.email"
                label="Email"
                name="email"
                id="member-form-email"
                type="text"
                i18nKeyPlaceholder="admin.groupsInvite.email"
                value={this.state.email}
                onChange={this.onChange}
              />
            </div>
            <div className="form-group action-select">
              <div className="form-btns add-admin justify">
                {this.renderSpinnerButton()}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

registerComponent("InviteOwner", InviteOwner);

export default InviteOwner;
