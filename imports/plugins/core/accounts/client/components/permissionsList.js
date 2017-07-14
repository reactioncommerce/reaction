import React, { Component } from "react";
import PropTypes from "prop-types";
import { CardGroup, List, ListItem } from "/imports/plugins/core/ui/client/components";

class PermissionsList extends Component {
  static propTypes = {
    packages: PropTypes.array
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <CardGroup>
        <List>
          {this.props.packages.map((pkg, key) => {
            if (!pkg) {
              return null;
            }
            return (
              <ListItem
                actionType="switch"
                key={key}
                label={pkg.label}
                switchOn={pkg.enabled}
                switchName={pkg.value}
                onSwitchChange={() => {}}
              />
            );
          })}
        </List>
      </CardGroup>
    );
  }
}

export default PermissionsList;
