import React, { Component, PropTypes } from "react";
import { Card, CardHeader, CardBody, List, ListItem } from "/imports/plugins/core/ui/client/components";
import { getComponent } from "/imports/plugins/core/layout/lib/components";
import { map } from "lodash";

class PackageList extends Component {
  static propTypes = {
    groupedPackages: PropTypes.object,
    handleShowPackage: PropTypes.func,
    onCardExpand: PropTypes.func
  }

  state = {}

  isExpanded(cardName) {
    return this.state[`card_${cardName}`] && this.state[`card_${cardName}`].isExpanded
  }

  handleCardExpand(cardName) {
    let isExpanded;

    if (typeof this.state[`card_${cardName}`] === "undefined") {
      isExpanded = true;
    } else {
      isExpanded = !this.state[`card_${cardName}`].isExpanded;
    }

    this.setState({
      [`card_${cardName}`]: {
        isExpanded
      }
    });

    if (this.props.onCardExpand) {
      this.props.onCardExpand(cardName);
    }
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

  renderSections() {
    if (this.props.groupedPackages) {
      // Loop through the groups of packages
      return map(this.props.groupedPackages, (group, groupIndex) => {
        // Loop through the individual cards of packages
        if (Array.isArray(group.packages)) {
          const items = group.packages.map((packageData, index) => {
            const elements = [];

            // Standard list element
            elements.push(
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

            // Look for a registered component_ActionDashboard component
            const actionComponent = getComponent(`${packageData.template}_ActionDashboard`);

            // If one exists, add it to the list of elements
            if (actionComponent) {
              elements.push(
                <Card expandable={true} key={`action-${index}`}>
                  <CardBody>
                    {React.createElement(actionComponent)}
                  </CardBody>
                </Card>
              );
            }

            return elements;
          });

          return (
            <Card
              key={groupIndex}
              expanded={this.isExpanded("productDetails")}
              onExpand={this.handleCardExpand.bind(this, "productDetails")}
            >
              <CardHeader
                actAsExpander={true}
                title={group.title}
                i18nKeyTitle={group.i18nKeyTitle}
              />
              <CardBody expandable={true}>
                {items}
              </CardBody>
            </Card>
          );
        }

        return null;
      });
    }

    return null;
  }

  render() {
    return (
      <List>
        {this.renderSections()}
      </List>
    );
  }
}

export default PackageList;
