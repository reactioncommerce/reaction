import React, { Component } from "react";
import PropTypes from "prop-types";
import { TacoTable } from "react-taco-table";

class SortableTableLegacy extends Component {
  render() {
    const {
      data,
      columns
    } = this.props;

    return (
      <TacoTable
        className="table sortable-table"
        columns={columns}
        onRowClick={this.handleRowClick}
        data={data}
      />
    );
  }
}

SortableTableLegacy.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  onRowClick: PropTypes.func
};

export default SortableTableLegacy;
