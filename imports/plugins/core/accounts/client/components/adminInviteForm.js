import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardBody } from "/imports/plugins/core/ui/client/components";
import { Reaction, i18next } from "/client/api";
import { Meteor } from "meteor/meteor";

class AdminInviteForm extends Component {
  static propTypes = {
    accounts: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      name: "",
      email: ""
    };
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { name, email } = this.state;
    return Meteor.call("accounts/inviteShopMember", Reaction.getShopId(), email, name, (error, result) => {
      if (error) {
        let message;
        if (error.reason === "Unable to send invitation email.") {
          message = i18next.t("accountsUI.error.unableToSendInvitationEmail");
        } else if (error.reason !== "A user with this email address already exists") {
          message = i18next.t("accountsUI.error.userWithEmailAlreadyExists");
        } else if (error.reason !== "") {
          message = error;
        } else {
          message = `${i18next.t("accountsUI.error.errorSendingEmail")} ${error}`;
        }
        Alerts.toast(i18next.t("accountsUI.info.errorSendingEmail", `Error sending email. ${message}`), "error");
        this.setState({ name: "", email: "" });
        return false;
      }
      if (result) { // TODO: Change to <Alert>
        Alerts.toast(i18next.t("accountsUI.info.invitationSent", "Invitation sent."), "success");
        this.setState({ name: "", email: "" });
      }
    });
  }

  renderForm() {
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <form className="">
            <div className="form-group">
              <label htmlFor="member-form-name"><span data-i18n="accountsUI.name">Name</span></label>
              <input type="text"
                className="form-control"
                id="member-form-name"
                name="name"
                placeholder="John Smith"
                onChange={this.onChange}
                value={this.state.name}
              />
            </div>
            <div className="form-group">
              <label htmlFor="member-form-email"><span data-i18n="accountsUI.email">Email</span></label>
              <input type="email"
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
                <span data-i18n="accountsUI.info.sendInvitation">Send Invitation</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }


  render() {
    return (
      <Card expanded={true}>
        <CardHeader
          actAsExpander={true}
          data-i18n="accountsUI.info.addAdminUser"
          title="Add Admin User"
          id="accounts"
        />
        <CardBody expandable={true}>
          {this.renderForm()}
        </CardBody>
      </Card>
    );
  }
}

export default AdminInviteForm;
