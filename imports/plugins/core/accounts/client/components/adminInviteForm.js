import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardBody } from "/imports/plugins/core/ui/client/components";

// TODO: need to wire form up for saving...
class AdminInviteForm extends Component {
  static propTypes = {
    accounts: PropTypes.array
  }

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  renderForm() {
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <form className="">
            <div className="form-group">
              <label htmlFor="member-form-name"><span data-i18n="accountsUI.name">Name</span></label>
              <input type="text" className="form-control" id="member-form-name" name="name"
                placeholder="John Smith"
              />
            </div>
            <div className="form-group">
              <label htmlFor="member-form-email"><span data-i18n="accountsUI.email">Email</span></label>
              <input type="email" className="form-control" id="member-form-email" name="email"
                placeholder="johnsmith@reactioncommerce.com"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#ffffff", color: "#4f575b" }}>
                <span data-i18n="accountsUI.info.resetPassword">Reset Password</span>
              </button>
              <button type="submit" className="btn btn-primary">
                <span data-i18n="accountsUI.info.resendPassword">Resend Password</span>
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
