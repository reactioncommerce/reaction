import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon } from "/imports/plugins/core/ui/client/components";

class ShippoTableColumn extends Component {
  static propTypes = {
    data: PropTypes.object,
    row: PropTypes.object
  }

  render() {
    const { row } = this.props;

    const renderColumn = row.column.id;

    if (renderColumn === "enabled") {
      if (row.value === true) {
        return (
          <span>
            <Icon icon="fa fa-check" className="enabled" />
          </span>
        );
      }
      return (
        <span>
          <Icon icon="fa fa-check" className="disabled" />
        </span>
      );
    }
    return (
      <span>{row.value}</span>
    );
  }
}

export default ShippoTableColumn;
