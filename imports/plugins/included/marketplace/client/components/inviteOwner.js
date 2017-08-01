import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { Components } from "@reactioncommerce/reaction-components";

class InviteOwner extends Component {
  constructor() {
    super();

    this.state = {
      name: "",
      email: "",
      group: "",
      alertArray: []
    };
  }

  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  removeAlert = oldAlert => {
    return this.setState({
      alertArray: this.state.alertArray.filter(alert => JSON.stringify(alert) === JSON.stringify(oldAlert))
    });
  };

  handleSubmit(event) {
    event.preventDefault();
    const { name, email } = this.state;

    Meteor.call("accounts/inviteShopOwner", { name, email }, (error, result) => {
      let newAlert;
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
        newAlert = {
          message,
          mode: "danger",
          options: { autoHide: 4000, i18nKey: messageKey }
        };
      }

      if (result) {
        this.setState({ name: "", email: "" });
        newAlert = {
          mode: "success",
          options: { autoHide: 4000, i18nKey: "accountsUI.info.invitationSent" }
        };
      }

      return this.setState({ alertArray: [...this.state.alertArray, newAlert] });
    });
  }

  render() {
    return (
      <div className="panel panel-default admin-invite-form">
        <Components.Alerts alerts={this.state.alertArray} onAlertRemove={this.removeAlert} />
        <div className="panel-body">
          <form className="invite-owner">
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
                <Components.Button
                  status="primary"
                  onClick={this.handleSubmit}
                  bezelStyle="solid"
                  i18nKeyLabel="accountsUI.info.sendInvitation"
                  label="Send Invitation"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default InviteOwner;
