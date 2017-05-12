import React, { Component, PropTypes } from "react";
import { map } from "lodash";
import { getComponent } from "/imports/plugins/core/layout/lib/components";
import { FlatButton, Icon } from "/imports/plugins/core/ui/client/components";
import { isEqual } from "lodash";

class ShortcutBar extends Component {
  static propTypes = {
    currentView: PropTypes.object,
    groupedPackages: PropTypes.object,
    handleOpenShortcut: PropTypes.func,
    handleShowDashboard: PropTypes.func,
    handleShowPackage: PropTypes.func
  }

  renderAdminButton() {
    return (
      <FlatButton onClick={this.props.handleShowDashboard}>
        <Icon
          icon="icon icon-reaction-logo"
          style={{
            fontSize: 24
          }}
        />
      </FlatButton>
    );
  }

  renderSections() {
    if (this.props.groupedPackages) {
      // Loop through the groups of packages
      return map(this.props.groupedPackages, (group, groupName) => {
        // Loop through the individual cards of packages
        if (Array.isArray(group.packages)) {
          const items = group.packages.map((packageData, index) => {
            const isActive = isEqual(this.props.currentView, packageData);
            let popoverContent = packageData.label;

            // Look for a registered component_ActionDashboard component
            const actionComponent = getComponent(`${packageData.template}_ActionDashboard`);

            // If one exists, add it to the list of elements
            if (actionComponent) {
              popoverContent = React.createElement(actionComponent);
            }

            // Standard list element
            return (
              <FlatButton
                active={isActive}
                key={index}
                i18nKeyTooltip={packageData.i18nKeyLabel}
                icon={packageData.icon}
                onClick={this.props.handleOpenShortcut}
                tooltip={popoverContent}
                value={packageData}
                tooltipAttachment="middle left"
              />
            );
          });

          return (
            <nav
              key={groupName}
              className="rui toolbar-group admin-controls-quicklinks"
              style={{
                marginBottom: 20
              }}
            >
              {items}
            </nav>
          );
        }

        return null;
      });
    }

    return null;
  }

  render() {
    return (
      <div className="rui toolbar toolbar-vertical admin-shortcut-bar">
        <nav
          style={{
            height: 54,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {this.renderAdminButton()}
        </nav>
        {this.renderSections()}
      </div>

    );
  }
}

export default ShortcutBar;
