import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Accounts } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import SettingsComponent from "../components/settings";

class SettingsContainer extends Component {
  static propTypes = {
    shopUsers: PropTypes.array
  }

  render() {
    return (
      <SettingsComponent accounts={this.props.shopUsers} />
    );
  }
}

const composer = (props, onData) => {
  const shopUsers = Accounts.find().fetch();

  onData(null, {
    shopUsers
  });
};

export default composeWithTracker(composer, null)(SettingsContainer);
