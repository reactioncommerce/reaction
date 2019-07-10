import React, { Component } from "react";
import PropTypes from "prop-types";
import { map } from "lodash";
import { Card, CardHeader, CardBody, CardGroup, ListItem } from "/imports/plugins/core/ui/client/components";
import { getComponent } from "@reactioncommerce/reaction-components";

class PackageList extends Component {
  static propTypes = {
    groupedPackages: PropTypes.object,
    handleShowPackage: PropTypes.func,
    onCardExpand: PropTypes.func
  }

  state = {}

  isExpanded(cardName) {
    if (this.state[`card_${cardName}`] && typeof this.state[`card_${cardName}`].isExpanded === "boolean") {
      return this.state[`card_${cardName}`].isExpanded;
    }

    return true;
  }

  handleCardExpand(cardName) {
    let isExpanded;

    if (typeof this.state[`card_${cardName}`] === "undefined") {
      isExpanded = false;
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

  renderSections() {
    if (this.props.groupedPackages) {
      // Loop through the groups of packages
      return map(this.props.groupedPackages, (group, groupName) => {
        // Loop through the individual cards of packages
        if (Array.isArray(group.packages)) {
          const items = group.packages.map((packageData, index) => {
            const elements = [];

            // Standard list element
            elements.push((
              <ListItem
                key={index}
                i18nKeyLabel={packageData.i18nKeyLabel}
                icon={packageData.icon}
                label={packageData.label}
                onClick={this.props.handleShowPackage}
                actionType="arrow"
                value={packageData}
              />
            ));

            // Look for a registered component_ActionDashboard component

            let actionComponent;

            try {
              actionComponent = getComponent(`${packageData.template}_ActionDashboard`);
            } catch (error) {
              actionComponent = null;
            } finally {
              // If one exists, add it to the list of elements
              if (actionComponent) {
                elements.push(<Card expandable={true} key={`action-${index}`}>
                  <CardBody>
                    {React.createElement(actionComponent)}
                  </CardBody>
                </Card>);
              }
            }

            return elements;
          });

          return (
            <Card
              key={groupName}
              expanded={this.isExpanded(groupName)}
              onExpand={this.handleCardExpand.bind(this, groupName)}
            >
              <CardHeader
                actAsExpander={true}
                title={group.title}
                i18nKeyTitle={group.i18nKeyTitle}
              />
              <CardBody expandable={true} padded={false}>
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
      <CardGroup>
        {this.renderSections()}
      </CardGroup>
    );
  }
}

export default PackageList;
