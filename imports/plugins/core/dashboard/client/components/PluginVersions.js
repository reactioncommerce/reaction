import React, { Component } from "react";
import PropTypes from "prop-types";
import PluginVersion from "./PluginVersion";

class PluginVersions extends Component {
  static propTypes = {
    versionedPackages: PropTypes.object
  };

  render() {
    const { versionedPackages } = this.props;
    return <div>
      {versionedPackages.map((versionedPackage) => <PluginVersion versionedPackage={versionedPackage} key={versionedPackage._id}/>)}
    </div>;
  }
}

export default PluginVersions;
