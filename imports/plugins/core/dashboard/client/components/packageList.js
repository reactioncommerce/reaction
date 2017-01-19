import React, { Component, PropTypes } from "react";
import { Card, CardTitle, CardHeader, CardBody, List, ListItem } from "/imports/plugins/core/ui/client/components";
import { getComponent } from "/imports/plugins/core/layout/lib/components";

class PackageList extends Component {
  static propTypes = {
    groupedPackages: PropTypes.object,
    handleShowPackage: PropTypes.func
  }

  renderActions() {
    if (this.props.groupedPackages && Array.isArray(this.props.groupedPackages.actions)) {
      const items = this.props.groupedPackages.actions.map((packageData, index) => {
        let element;
        const actionComponent = getComponent(`${packageData.template}_ActionDashboard`);

        if (actionComponent) {
          element = (
            <Card expandable={true} key={`action-${index}`}>
              <CardBody>
                {React.createElement(actionComponent)}
              </CardBody>
            </Card>
          );
        }

        return [
          <ListItem
            key={index}
            i18nKeyLabel={packageData.i18nKeyLabel}
            icon={packageData.icon}
            label={packageData.label}
            onClick={this.props.handleShowPackage}
            actionType="arrow"
            value={packageData}
          />,
          element
        ];
      });

      return items;
    }

    return null;
  }

  renderConfigurations() {
    if (this.props.groupedPackages && Array.isArray(this.props.groupedPackages.settings)) {
      const items = this.props.groupedPackages.settings.map((packageData, index) => {
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
    }

    return null;
  }

  render() {
    return (
      <List>
        {this.renderActions()}
        {this.renderConfigurations()}
      </List>
    );
  }
}

export default PackageList;
