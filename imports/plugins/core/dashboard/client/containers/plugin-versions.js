import React, { Component } from "react";
import PropTypes from "prop-types";
import PluginVersion from "../components/plugin-versions";

class PluginVersionsContainer extends Component {
  static propTypes = {
    versionedPackages: PropTypes.object
  };

  render() {
    const { versionedPackages } = this.props;
    return (
      <div>
        {versionedPackages.map((versionedPackage) => {
          return <PluginVersion versionedPackage={versionedPackage} key={versionedPackage._id} />;
        })}
      </div>
    );
  }
}

export default PluginVersionsContainer;
