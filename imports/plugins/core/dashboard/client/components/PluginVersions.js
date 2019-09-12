import React from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import PluginVersion from "./PluginVersion";

/**
 * PluginVersions
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function PluginVersions(props) {
  const { versionedPackages } = props;
  return (
    <Card>
      <CardHeader
        title={i18next.t("shopSettings.pluginVersions.title")}
      />
      <CardContent>
        {versionedPackages.map((versionedPackage) => <PluginVersion versionedPackage={versionedPackage} key={versionedPackage._id}/>)}
      </CardContent>
    </Card>
  );
}

PluginVersions.propTypes = {
  versionedPackages: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired
  }))
};

export default PluginVersions;
