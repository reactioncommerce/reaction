import React, { Component, PropTypes } from "react";
import { Card, CardHeader, CardBody, List, ListItem } from "/imports/plugins/core/ui/client/components";
import { map } from "lodash";

class PackageList extends Component {
  static propTypes = {
    groupedPackages: PropTypes.object,
    handleShowPackage: PropTypes.func
  }
  // renderPackages() {
  //   if (Array.isArray(this.props.packages)) {
  //     return this.props.packages.map((packageData) => {
  //       return (
  //         <ListItem
  //           i18nKeyLabel={packageData.i18nKeyLabel}
  //           icon={packageData.icon}
  //           label={packageData.label}
  //           onClick={this.props.handleShowPackage}
  //           actionType="arrow"
  //           value={packageData}
  //         />
  //       );
  //     });
  //   }
  // }

  renderPackages() {
    if (this.props.groupedPackages) {
      return map(this.props.groupedPackages, (group, name) => {
        const items = group.map((packageData, index) => {
          return (
            <ListItem
              key={index}
              i18nKeyLabel={packageData.i18nKeyLabel}
              icon={packageData.icon}
              label={packageData.label}
              onClick={this.props.handleShowPackage}
              actionType="arrow"
              value={packageData}
            />
          );
        });

        return (
          <Card expandable={true}>
            <CardHeader title={name} />
            <CardBody>
              {items}
            </CardBody>
          </Card>
        );
      });
    }

    return null;
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
