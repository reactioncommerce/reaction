import React, { Component, PropTypes } from "react";
import { List, ListItem } from "/imports/plugins/core/ui/client/components"

class PackageList extends Component {

  renderPackages() {
    if (Array.isArray(this.props.packages)) {
      return this.props.packages.map((packageData) => {
        return (
          <ListItem
            i18nKeyLabel={packageData.i18nKeyLabel}
            icon={packageData.icon}
            label={packageData.label}
            onClick={this.props.handleShowPackage}
            actionType="arrow"
            value={packageData}
          />
        );
      });
    }
  }

  render() {
    return (
      <List>
        {this.renderPackages()}
      </List>
    );
  }
}

export default PackageList;
