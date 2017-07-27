import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Meteor } from "meteor/meteor";

class AdminInviteForm extends Component {
  static propTypes = {
    accounts: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      alertArray: [],
      name: "",
      email: ""
    };
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  removeAlert = (oldAlert) => {
    return this.setState({
      alertArray: this.state.alertArray.filter((alert) => !_.isEqual(alert, oldAlert))
    });
  };

  handleSubmit(event) {
    event.preventDefault();
    const { name, email } = this.state;
    return Meteor.call("accounts/inviteShopMember", Reaction.getShopId(), email, name, (error, result) => {
      let newAlert;
      let message = "";
      if (error) {
        let messageKey;
        if (error.reason === "Unable to send invitation email.") {
          messageKey = "accountsUI.error.unableToSendInvitationEmail";
        } else if (error.reason !== "A user with this email address already exists") {
          messageKey = "accountsUI.error.userWithEmailAlreadyExists";
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
        newAlert = {
          mode: "success",
          options: { autoHide: 4000, i18nKey: "accountsUI.info.invitationSent" }
        };
      }

      return this.setState({ name: "", email: "", alertArray: [...this.state.alertArray, newAlert] });
    });
  }

  renderForm() {
    return (
      <div className="panel panel-default">
        <Components.Alerts alerts={this.state.alertArray} onAlertRemove={this.removeAlert} />
        <div className="panel-body">
          <form className="">
            <div className="form-group">
              <label htmlFor="member-form-name">
                <Components.Translation className="content-cell" defaultValue="Name" i18nKey="accountsUI.name" />
              </label>
              <input
                type="text"
                className="form-control"
                id="member-form-name"
                name="name"
                placeholder="John Smith"
                onChange={this.onChange}
                value={this.state.name}
              />
            </div>
            <div className="form-group">
              <label htmlFor="member-form-email">
                <Components.Translation className="content-cell" defaultValue="Email" i18nKey="accountsUI.email" />
              </label>
              <input
                type="email"
                className="form-control"
                id="member-form-email"
                name="email"
                placeholder="johnsmith@reactioncommerce.com"
                onChange={this.onChange}
                value={this.state.email}
              />
            </div>
            <div className="form-btns add-admin justify">
              <button className="btn btn-primary" onClick={this.handleSubmit}>
                <Components.Translation
                  className="content-cell"
                  defaultValue="Send Invitation"
                  i18nKey="accountsUI.info.sendInvitation"
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Components.Card expanded={true}>
        <Components.CardHeader
          actAsExpander={true}
          data-i18n="accountsUI.info.addAdminUser"
          title="Add Admin User"
          id="accounts"
        />
        <Components.CardBody expandable={true}>
          {this.renderForm()}
        </Components.CardBody>
      </Components.Card>
    );
  }
}

registerComponent("AdminInviteForm", AdminInviteForm);

export default AdminInviteForm;
