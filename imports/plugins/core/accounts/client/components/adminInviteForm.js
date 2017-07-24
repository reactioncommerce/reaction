import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Button, Card, CardHeader, CardBody, DropDownMenu, MenuItem, Translation, Alerts } from "@reactioncommerce/reaction-ui";
import { Reaction } from "/client/api";
import { Meteor } from "meteor/meteor";

class AdminInviteForm extends Component {
  static propTypes = {
    defaultInviteGroup: PropTypes.object,
    groups: PropTypes.array
  };

  constructor(props) {
    super(props);
    const { defaultInviteGroup, groups } = props;
    this.state = {
      groups,
      defaultInviteGroup,
      name: "",
      email: "",
      group: "",
      alertArray: []
    };
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { groups, defaultInviteGroup } = nextProps;
    this.setState({ groups, defaultInviteGroup });
  }

  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleGroupSelect = (event, group) => {
    this.setState({ group });
  };

  removeAlert = (oldAlert) => {
    return this.setState({
      alertArray: this.state.alertArray.filter((alert) => !_.isEqual(alert, oldAlert))
    });
  };

  handleSubmit(event) {
    event.preventDefault();
    const { name, email, group, defaultInviteGroup } = this.state;

    if (!group._id && !defaultInviteGroup._id) {
      return this.setState({
        alertArray: [{
          mode: "danger",
          options: { autoHide: 4000, i18nKey: "accountsUI.error.groupRequired" }
        }]
      });
    }
    const finalGroupId = group._id || defaultInviteGroup._id;
    const options = { email, name, shopId: Reaction.getShopId(), groupId: finalGroupId };
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

  renderDropDownButton() {
    const { defaultInviteGroup, group } = this.state;
    const buttonGroup = group || defaultInviteGroup;
    if (!buttonGroup._id) {
      return null;
    }
    const buttonElement = (
      <Button bezelStyle="solid" label={buttonGroup.name && _.startCase(buttonGroup.name)} >
        &nbsp;<i className="fa fa-chevron-down" />
      </Button>
    );
    return (
      <DropDownMenu buttonElement={buttonElement} attachment="bottom center" onChange={this.handleGroupSelect}>
        {this.state.groups
          .filter((grp) => grp._id !== buttonGroup._id)
          .map((grp, index) => (
            <MenuItem
              key={index}
              label={_.startCase(grp.name)}
              selectLabel={_.startCase(grp.name)}
              value={grp}
            />
          ))}
      </DropDownMenu>
    );
  }

  renderForm() {
    return (
      <div className="panel panel-default admin-invite-form">
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
            <div className="form-group action-select">
              {this.renderDropDownButton()}
              <div className="form-btns add-admin justify">
                <button className="btn btn-primary" onClick={this.handleSubmit}>
                  <Translation
                    className="content-cell"
                    defaultValue="Send Invitation"
                    i18nKey="accountsUI.info.sendInvitation"
                  />
                </button>
              </div>
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
