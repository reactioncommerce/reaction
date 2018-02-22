import React, { Component } from "react";
import PropTypes from "prop-types";
import { TextField } from "@reactioncommerce/reaction-ui";


class SortableTableFilter extends Component {
  render() {
    return (
      <TextField
        i18nKeyPlaceholder="reactionUI.components.sortableTable.filterPlaceholder"
        id="react-table-filter-input"
        name={this.props.name}
        onChange={this.props.onChange}
        placeholder="Filter Data"
        tabIndex={0}
        type="text"
        value={this.props.value}
      />
    );
  }
}


SortableTableFilter.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string
};

export default SortableTableFilter;
