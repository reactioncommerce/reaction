import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Button, Card, CardHeader, CardBody, DropDownMenu, MenuItem, Translation, Alerts } from "@reactioncommerce/reaction-ui";
import { Reaction } from "/client/api";
import { Meteor } from "meteor/meteor";

class AdminInviteForm extends Component {
  static propTypes = {
    groups: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      alertArray: [],
      groups: props.groups,
      name: "",
      email: "",
      groupId: ""
    };
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleGroupSelect(event, groupId) {
    console.log({ groupId });
    this.setState({ groupId });
  }

  removeAlert = (oldAlert) => {
    return this.setState({
      alertArray: this.state.alertArray.filter((alert) => !_.isEqual(alert, oldAlert))
    });
  };

  handleSubmit(event) {
    event.preventDefault();
    const { name, email, groupId } = this.state;
    const options = { shopId: Reaction.getShopId(), email, name, groupId };

    return Meteor.call("accounts/inviteShopMember", options, (error, result) => {
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
    const button = (<Button bezelStyle="flat" i18nKeyLabel="admin.groups.selectGroup" label="Select Group" />);
    return (
      <div className="panel panel-default">
        <Alerts alerts={this.state.alertArray} onAlertRemove={this.removeAlert} />
        <div className="panel-body">
          <form className="">
            <div className="form-group">
              <label htmlFor="member-form-name">
                <Translation className="content-cell" defaultValue="Name" i18nKey="accountsUI.name" />
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
                <Translation className="content-cell" defaultValue="Email" i18nKey="accountsUI.email" />
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
            <DropDownMenu
              buttonElement={button}
              attachment="bottom center"
              onChange={this.handleGroupSelect}
            >
              {this.state.groups
                .map((grp, index) => (
                  <MenuItem
                    key={index}
                    label={_.startCase(grp.name)}
                    selectLabel={_.startCase(grp.name)}
                    value={grp._id}
                  />
                ))}
            </DropDownMenu>
            <div className="form-btns add-admin justify">
              <button className="btn btn-primary" onClick={this.handleSubmit}>
                <Translation
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
