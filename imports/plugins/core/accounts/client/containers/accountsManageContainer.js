import React, { Component } from "react";
import PropTypes from "prop-types";
import { composeWithTracker } from "/lib/api/compose";
import AdminInviteForm from "../components/adminInviteForm";
import AddGroupMembers from "../components/addGroupMembers";

class AccountsManageContainer extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    group: PropTypes.object
  }

  render() {
    return (
      <div className="groups-form">
        <AdminInviteForm />
        <AddGroupMembers {...this.props} />
      </div>
    );
  }
}


const composer = (props, onData) => {
  onData(null, { ...props.data });
};

export default composeWithTracker(composer, null)(AccountsManageContainer);
