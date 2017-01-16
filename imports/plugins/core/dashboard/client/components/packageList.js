import React, { Component, PropTypes } from "react";
import { Card, CardHeader, CardBody, List, ListItem } from "/imports/plugins/core/ui/client/components"
import { map } from "lodash"
class PackageList extends Component {

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
    if (true) {
      return map(this.props.groupedPackages, (group, name) => {

        const items = group.map((packageData) => {
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
        })


        return (
          <Card expandable={true}>
            <CardHeader title={name} />
            <CardBody>
              {items}
            </CardBody>
          </Card>
        )

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
