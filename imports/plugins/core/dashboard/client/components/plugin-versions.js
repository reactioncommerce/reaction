import React, { Component } from "react";
import PropTypes from "prop-types";


export default class PluginVersion extends Component {
  static propTypes = {
    versionedPackage: PropTypes.object
  };

  render() {
    const { versionedPackage } = this.props;
    return (
      <div>
        <p>{versionedPackage.name} {versionedPackage.version}</p>
      </div>
    );
  }
}
