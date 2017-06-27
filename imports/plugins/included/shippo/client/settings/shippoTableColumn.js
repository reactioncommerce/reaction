import React, { Component, PropTypes } from "react";
import { Icon } from "/imports/plugins/core/ui/client/components";

class EmailTableColumn extends Component {
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
            <Icon icon="fa fa-check" className="valid" />
          </span>
        );
      }
      return (
        <span>
          <Icon icon="fa fa-times" className="error" />
        </span>
      );
    }
    return (
      <span>{row.value}</span>
    );
  }
}

export default EmailTableColumn;
