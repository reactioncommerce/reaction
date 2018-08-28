import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

export default class ConnectorsDashboard extends Component {
  static propTypes = {
    packages: PropTypes.arrayOf(PropTypes.object)
  }

  render() {
    const { packages } = this.props;
    if (packages && packages.length > 0) {
      const toRender = packages.map((pkg) => {
        const Comp = Components[pkg.registry[0].container];
        if (Comp) return <Comp key={pkg.name}/>;
        return null;
      });
      return toRender;
    }
    return null;
  }
}
