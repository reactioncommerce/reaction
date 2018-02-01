import React, { Component } from "react";
import PropTypes from "prop-types";
import { map, isEqual } from "lodash";
import { FlatButton, Icon } from "/imports/plugins/core/ui/client/components";

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

            // Standard list element
            return (
              <FlatButton
                active={isActive}
                key={index}
                i18nKeyTooltip={packageData.i18nKeyLabel}
                icon={packageData.icon}
                onClick={this.props.handleOpenShortcut}
                tooltip={packageData.label}
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
